import { getAuthToken } from "@lib/auth/auth";
import { dispatchTrialExpired } from "@lib/trial/trialEvents";
import { buildApiError } from "../errors/classify";
import { BASE_URL } from "../constants";

/**
 * Custom fetch mutator for orval (v8 calling convention: `(url, requestInit)`).
 * Prepends the API base URL, injects the auth token, parses the body and
 * normalises errors via {@link buildApiError}. Returns the parsed response body
 * directly (orval is configured with `includeHttpResponseReturnType: false`).
 */
export const executeFetch = async <T>(url: string, options: RequestInit): Promise<T> => {
  const token = await getAuthToken();

  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  } catch (networkError) {
    throw buildApiError({ cause: networkError });
  }

  if (response.status === 204) {
    return null as T; // No content
  }

  const contentType = response.headers.get("content-type") ?? "";
  let parsed: unknown = undefined;
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
    // The trial has expired: notify the app so the lock screen can take over.
    if (response.status === 402) dispatchTrialExpired();
    throw buildApiError({ status: response.status, body: parsed, rawBody });
  }

  return (parsed ?? (rawBody as unknown)) as T;
};
