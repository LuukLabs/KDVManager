import { type RequestConfig } from "./requestConfig";
import { determineUrl } from "./determineUrl";
import { getAuthToken } from "@lib/auth/auth";

export const executeFetch = async <T>(requestConfig: RequestConfig): Promise<T> => {
  const { data, method, params, url, headers, signal } = requestConfig;
  const token = await getAuthToken();

  const fetchHeaders = {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchUrl = determineUrl(url, params);

  const response = await fetch(fetchUrl, {
    headers: fetchHeaders,
    signal,
    method,
    ...(data ? { body: JSON.stringify(data) } : {}),
  });

  // If server responds with no content don't try to parse the response
  if (response.status === 204) {
    return null as T;
  }

  const json = (await response.json()) as T;

  if (!response.ok) {
    return Promise.reject(json);
  }

  return json;
};
