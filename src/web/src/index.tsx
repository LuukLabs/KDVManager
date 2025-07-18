import { StrictMode } from "react";
import "./index.css";
import App from "./App";
import { createRoot } from "react-dom/client";
import { SnackbarProvider } from "notistack";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/nl";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./lib/theme";
import { CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const container = document.getElementById("root") as Element;
const root = createRoot(container);
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401 errors (authentication issues)
        if (error?.status === 401) {
          return false;
        }
        // Default retry behavior for other errors
        return failureCount < 3;
      },
    },
  },
});

root.render(
  <StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="nl">
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <QueryClientProvider client={queryClient}>
            <SnackbarProvider>
              <App />
            </SnackbarProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </I18nextProvider>
    </LocalizationProvider>
  </StrictMode>,
);
