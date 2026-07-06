import { SpanStatusCode, trace } from "@opentelemetry/api";

const TRACER_NAME = "web.errors";

// Client-side rate limit so an error loop cannot flood the collector.
const MAX_ERROR_SPANS_PER_MINUTE = 20;
const RATE_WINDOW_MS = 60_000;

let windowStartedAt = 0;
let reportedInWindow = 0;

const isRateLimited = (): boolean => {
  const now = Date.now();
  if (now - windowStartedAt >= RATE_WINDOW_MS) {
    windowStartedAt = now;
    reportedInWindow = 0;
  }
  reportedInWindow += 1;
  return reportedInWindow > MAX_ERROR_SPANS_PER_MINUTE;
};

const toError = (value: unknown): Error =>
  value instanceof Error ? value : new Error(typeof value === "string" ? value : String(value));

/**
 * Reports an unexpected client-side error as a short-lived "app.error" span
 * (status ERROR, exception recorded). Errors ride the existing trace pipeline
 * to SigNoz, so no separate logs SDK is needed.
 *
 * Safe to call unconditionally: when telemetry is not initialised the API
 * returns a no-op tracer, and reports are rate-limited client-side.
 */
export const reportError = (error: unknown, source: string): void => {
  if (isRateLimited()) return;

  const err = toError(error);
  const span = trace.getTracer(TRACER_NAME).startSpan("app.error", {
    attributes: {
      "error.type": err.name,
      "error.message": err.message,
      "error.source": source,
      url: window.location.href,
    },
  });
  span.recordException(err);
  span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
  span.end();
};

/** Wires the global handlers for uncaught errors and unhandled promise rejections. */
export const registerErrorReporting = (): void => {
  window.addEventListener("error", (event) => {
    reportError(event.error ?? event.message, "window.error");
  });
  window.addEventListener("unhandledrejection", (event) => {
    reportError(event.reason, "unhandledrejection");
  });
};
