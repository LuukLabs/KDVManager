import { StrictMode } from "react";
import "./index.css";
import App from "./App";
import { createRoot } from "react-dom/client";
import { initTelemetry } from "./telemetry";

// Must run before React renders so fetch instrumentation and error reporting
// cover the whole app lifecycle. No-op unless an OTLP endpoint is configured.
initTelemetry();

const container = document.getElementById("root") as Element;
const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
