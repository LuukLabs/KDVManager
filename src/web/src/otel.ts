// OpenTelemetry web tracing initialization
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { context, trace } from '@opentelemetry/api';

// Guard to avoid re-initialization (e.g., Vite HMR)
if (!(window as any).__otel_initialized__) {
  (window as any).__otel_initialized__ = true;

  const serviceName = 'kdvmanager-web';
  const deploymentEnv = (import.meta.env.VITE_DEPLOY_ENV ?? import.meta.env.MODE) ?? 'development';
  const otlpEndpoint: string | undefined = import.meta.env.VITE_OTEL_EXPORTER_URL;

  const provider = new WebTracerProvider({
    resource: new Resource({
      'service.name': serviceName,
      'deployment.environment': deploymentEnv,
    }),
  });

  if (otlpEndpoint) {
    const exporter = new OTLPTraceExporter({
      url: otlpEndpoint.replace(/\/$/, '') + '/v1/traces',
      headers: {},
    });
    provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  }

  provider.register({ propagator: new B3Propagator() });

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [/.*/],
        clearTimingResources: true,
      }),
      new UserInteractionInstrumentation(),
    ],
  });

  // Expose trace helper for error boundaries etc.
  (window as any).getCurrentTraceId = () => {
    const span = trace.getSpan(context.active());
    return span?.spanContext().traceId;
  };
}
