import { useAuth0 } from "@auth0/auth0-react";
import { RequestConfig } from "./requestConfig";
import { determineUrl } from "./determineUrl";
import { ErrorResponse } from "./errorResponse";

export const useExecuteFetch = <T>(): ((requestConfig: RequestConfig) => Promise<T>) => {
  const { getAccessTokenSilently } = useAuth0();

  return async ({ data, method, params, url, headers, signal }: RequestConfig): Promise<T> => {
    const accessToken = await getAccessTokenSilently({
      authorizationParams: {
        audience: "https://api.kdvmanager.nl/",
      },
    });

    const response = await fetch(determineUrl(url, params), {
      headers: {
        ...headers,
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
      method: method,
      ...(data ? { body: JSON.stringify(data) } : {}),
    });

    const json = await response.json().catch(() => ({
      code: response.status,
      message: response.statusText,
      errors: {},
    }));

    if (!response.ok) {
      return Promise.reject(json);
    }

    return json as T;
  };
};

export type ErrorType = ErrorResponse;
