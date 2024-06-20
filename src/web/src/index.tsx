import { StrictMode } from "react";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createRoot } from "react-dom/client";
import { SnackbarProvider } from "notistack";
import NiceModal from "@ebay/nice-modal-react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

const container = document.getElementById("root") as Element;
const root = createRoot(container);

root.render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <SnackbarProvider>
        <NiceModal.Provider>
          <App />
        </NiceModal.Provider>
      </SnackbarProvider>
    </I18nextProvider>
  </StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
