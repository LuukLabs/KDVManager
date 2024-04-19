import { useAuth0 } from "@auth0/auth0-react";
import { RequestConfig } from "./requestConfig";
import { determineUrl } from "./determineUrl";

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

    // If server responds with no content don't try to parse the reponse
    if (response.status === 204) { 
      return undefined as T;
    }

    const json = (await response.json()) as T;

    if (!response.ok) {
      return Promise.reject(json);
    }

    return json;
  };
};
