import { StrictMode } from "react";
import "./index.css";
import App from "./App";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root") as Element;
const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
