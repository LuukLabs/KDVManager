import { trace } from "@opentelemetry/api";
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

const TRACER_NAME = "web.vitals";

/**
 * Emits a Core Web Vital as a zero-duration "web.vital" span with the metric
 * details as attributes. In SigNoz, filter on span name "web.vital" and group
 * or aggregate by the web_vital.* attributes to chart them.
 */
const reportMetric = (metric: Metric): void => {
  const span = trace.getTracer(TRACER_NAME).startSpan("web.vital", {
    attributes: {
      "web_vital.name": metric.name,
      "web_vital.value": metric.value,
      "web_vital.rating": metric.rating,
      "web_vital.id": metric.id,
      "web_vital.navigation_type": metric.navigationType,
      url: window.location.href,
    },
  });
  span.end();
};

/**
 * Registers Core Web Vitals collection. CLS/INP/LCP report when the page is
 * hidden; the browser BatchSpanProcessor auto-flushes on visibility change, so
 * those late metrics still reach the collector.
 */
export const registerWebVitals = (): void => {
  onCLS(reportMetric);
  onINP(reportMetric);
  onLCP(reportMetric);
  onFCP(reportMetric);
  onTTFB(reportMetric);
};
