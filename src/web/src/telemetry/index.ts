import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { BatchSpanProcessor, WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { BASE_URL } from "@api/constants";
import { registerErrorReporting } from "./errorReporting";
import { registerWebVitals } from "./webVitals";

const SESSION_ID_STORAGE_KEY = "kdv.telemetry.session-id";

/**
 * Returns a stable per-browser-session id so all telemetry from one visit can
 * be correlated in SigNoz. Survives SPA navigations, resets when the tab is
 * closed. Falls back to a per-page-load id when sessionStorage is unavailable.
 */
const getSessionId = (): string => {
  try {
    const existing = sessionStorage.getItem(SESSION_ID_STORAGE_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_STORAGE_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
};

const escapeForRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Resolves a possibly relative/protocol-relative URL against the current origin. */
const toAbsoluteUrl = (url: string): string => {
  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return url;
  }
};

/**
 * Builds a regex matching only the app's own API origin (from
 * VITE_API_BASE_URL, possibly protocol-relative). Trace context headers are
 * propagated exclusively to this origin — never to third parties like Auth0.
 */
const toOriginRegExp = (baseUrl: string | undefined): RegExp | undefined => {
  if (!baseUrl) return undefined;
  try {
    const origin = new URL(baseUrl, window.location.origin).origin;
    return new RegExp(`^${escapeForRegExp(origin)}(/|$)`);
  } catch {
    return undefined;
  }
};

let initialized = false;

/**
 * Bootstraps browser telemetry (traces to an OTLP/HTTP endpoint, global error
 * reporting and Core Web Vitals). Must be called once, before React renders.
 *
 * Entirely a no-op when VITE_OTEL_EXPORTER_OTLP_ENDPOINT is not set, so local
 * dev and tests emit nothing by default.
 */
export const initTelemetry = (): void => {
  const endpoint = import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT;
  if (!endpoint || initialized) return;
  initialized = true;

  const tracesUrl = `${endpoint.replace(/\/+$/, "")}/v1/traces`;

  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: "web",
      [ATTR_SERVICE_VERSION]: import.meta.env.VITE_APP_VERSION ?? "unknown",
      "deployment.environment": import.meta.env.MODE,
      "session.id": getSessionId(),
    }),
    spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter({ url: tracesUrl }))],
  });

  provider.register({ contextManager: new ZoneContextManager() });

  const apiOrigin = toOriginRegExp(BASE_URL);
  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        // Only send traceparent/tracestate to our own API gateway.
        propagateTraceHeaderCorsUrls: apiOrigin ? [apiOrigin] : [],
        // Never trace the telemetry export requests themselves.
        ignoreUrls: [new RegExp(`^${escapeForRegExp(toAbsoluteUrl(tracesUrl))}$`)],
      }),
    ],
  });

  registerErrorReporting();
  registerWebVitals();
};
