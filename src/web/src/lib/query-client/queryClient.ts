import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        console.debug("test", error);
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
