import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";
import { authConfig } from "@lib/auth/auth";

export const useAuthToken = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();

  const getToken = useCallback(async (): Promise<string> => {
    if (!isAuthenticated) {
      throw new Error("User is not authenticated");
    }

    try {
      return await getAccessTokenSilently({
        authorizationParams: {
          audience: authConfig.audience,
        },
      });
    } catch (error) {
      console.error("Failed to get access token:", error);
      throw error;
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  return {
    getToken,
    isAuthenticated,
    isLoading,
  };
};
