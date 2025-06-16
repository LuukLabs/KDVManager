import { type RequestConfig } from "./requestConfig";
import { determineUrl } from "./determineUrl";
import { authInterceptor } from "../interceptors/authInterceptor";

export const executeFetch = async <T>(requestConfig: RequestConfig): Promise<T> => {
  const { data, method, params, url, headers, signal } = requestConfig;

  const fetchConfig = {
    url: determineUrl(url, params),
    headers: {
      ...headers,
    },
    signal,
    method: method,
    ...(data ? { body: JSON.stringify(data) } : {}),
  };

  // Apply auth interceptor
  const configWithAuth = await authInterceptor.intercept(fetchConfig);

  const response = await fetch(configWithAuth.url, {
    headers: configWithAuth.headers,
    signal: configWithAuth.signal,
    method: configWithAuth.method,
    body: configWithAuth.body,
  });

  // If server responds with no content don't try to parse the response
  if (response.status === 204) {
    return undefined as T;
  }

  const json = (await response.json()) as T;

  if (!response.ok) {
    return Promise.reject(json);
  }

  return json;
};
