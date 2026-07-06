import { type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { SnackbarProvider } from "notistack";
import { onTestFinished } from "vitest";
import { cleanup, render, type RenderOptions, type RenderResult } from "vitest-browser-react";

type TestProvidersProps = {
  children: ReactNode;
  /**
   * Locale forwarded to MUI X LocalizationProvider. Defaults to "en" so
   * keyboard input/format is predictable across CI machines.
   */
  locale?: string;
  queryClient?: QueryClient;
};

const TestProviders = ({ children, locale = "en", queryClient }: TestProvidersProps) => {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });
  return (
    <QueryClientProvider client={client}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
        <SnackbarProvider>
          <MemoryRouter>{children}</MemoryRouter>
        </SnackbarProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
};

/**
 * Wraps `vitest-browser-react`'s `render` with the providers every test needs.
 * The returned object exposes browser-locator queries (`getByRole`,
 * `getByLabelText`, ...) that lazily resolve in the real DOM and have a
 * built-in retry/visibility model — no `findBy*` vs `getBy*` split needed.
 */
export const renderWithProviders = (
  ui: ReactNode,
  options?: Omit<RenderOptions, "wrapper"> & Omit<TestProvidersProps, "children">,
): Promise<RenderResult> => {
  const { locale, queryClient, ...rest } = options ?? {};
  // vitest-browser-react registers its own cleanup via a module-scope
  // beforeEach, but with `isolate: false` that side effect only binds to the
  // first test file that imports the module — later files accumulate mounted
  // trees (leaked dialogs/backdrops swallow clicks; duplicate elements trip
  // strict mode). Register cleanup per test instead, which always binds.
  onTestFinished(() => cleanup());
  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders locale={locale} queryClient={queryClient}>
        {children}
      </TestProviders>
    ),
    ...rest,
  });
};
