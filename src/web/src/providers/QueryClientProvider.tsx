import type { PropsWithChildren } from "react";
import { QueryClientProvider as ReactQueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@lib/query-client/queryClient";
import { ReactQueryDevtools } from "@lib/query-client/ReactQueryDevtools";

type QueryClientProviderProps = PropsWithChildren;

export const QueryClientProvider = ({ children }: QueryClientProviderProps) => {
  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </ReactQueryClientProvider>
  );
};
