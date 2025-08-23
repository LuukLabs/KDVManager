import { type RequestConfig } from "./requestConfig";
import { determineUrl } from "./determineUrl";
import { getAuthToken } from "@lib/auth/auth";
import { buildApiError } from "../errors/classify";

export const executeFetch = async <T>(requestConfig: RequestConfig): Promise<T> => {
  const { data, method, params, url, headers, signal } = requestConfig;
  const token = await getAuthToken();

  const fetchHeaders = {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchUrl = determineUrl(url, params);

  let response: Response;
  try {
    response = await fetch(fetchUrl, {
      headers: fetchHeaders,
      signal,
      method,
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
  } catch (networkError) {
    throw buildApiError({ cause: networkError });
  }

  if (response.status === 204) {
    return null as T; // No content
  }

  const contentType = response.headers.get("content-type") ?? "";
  let parsed: any = undefined;
  let rawBody: string | undefined;
  if (contentType.includes("application/json")) {
    try {
      parsed = await response.json();
    } catch (parseError) {
      // JSON expected but failed to parse
      throw buildApiError({ status: response.status, rawBody, cause: parseError });
    }
  } else {
    // Fallback to text (could be empty)
    try {
      rawBody = await response.text();
    } catch {
      // ignore read errors
    }
  }

  if (!response.ok) {
    throw buildApiError({ status: response.status, body: parsed, rawBody });
  }

  return (parsed ?? (rawBody as unknown)) as T;
};
