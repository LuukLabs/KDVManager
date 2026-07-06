import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "@api/errors/types";
import { redirectToLogin } from "@lib/auth/auth";

const isUnauthorized = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 401;

// Access tokens are refreshed silently, so a 401 means the session has truly
// expired: restart the login flow instead of surfacing a generic error.
const onApiError = (error: unknown) => {
  if (isUnauthorized(error)) redirectToLogin();
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: onApiError }),
  mutationCache: new MutationCache({ onError: onApiError }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => !isUnauthorized(error) && failureCount < 3,
    },
  },
});
