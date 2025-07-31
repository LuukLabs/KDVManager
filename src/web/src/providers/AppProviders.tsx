import { type PropsWithChildren, Suspense } from "react";
import { QueryClientProvider } from "./QueryClientProvider";
import { RouterProvider } from "./RouterProvider";
import AuthProvider from "./AuthProvider";
import LoadingAnimation from "@components/LoadingAnimation";
import NiceModal from "@ebay/nice-modal-react";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { theme } from "@lib/theme";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/nl";
import { I18nextProvider } from "react-i18next";
import i18n from "@lib/i18n/i18n";

type AppProvidersProps = PropsWithChildren & {
  enableRouter?: boolean;
};

export const AppProviders = ({ children, enableRouter = true }: AppProvidersProps) => {
  return (
    <AuthProvider>
      <I18nextProvider i18n={i18n}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="nl">
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryClientProvider>
              <NiceModal.Provider>
                {enableRouter ? (
                  <Suspense fallback={<LoadingAnimation />}>
                    <RouterProvider />
                  </Suspense>
                ) : (
                  children
                )}
              </NiceModal.Provider>
            </QueryClientProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </I18nextProvider>
    </AuthProvider>
  );
};
