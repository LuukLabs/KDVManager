import { getAuthToken } from "@lib/auth/auth";
import { buildApiError } from "../errors/classify";
import { BASE_URL } from "../constants";

/**
 * Reads the total record count attached to a paginated list result.
 *
 * orval v8 types paginated operations as `Promise<Item[]>`, so the total count
 * (returned in the `X-Total` response header) cannot live in the return type.
 * {@link executeFetchPaginated} attaches it as a non-enumerable `total` property
 * on the returned array; use this helper to read it back in a type-safe way.
 */
export const getTotal = (data: unknown): number => {
  if (Array.isArray(data)) {
    const total = (data as { total?: number }).total;
    return typeof total === "number" ? total : data.length;
  }
  return 0;
};

/**
 * Custom fetch mutator for paginated orval operations (v8 calling convention:
 * `(url, requestInit)`). Behaves like the regular fetch mutator but additionally
 * captures the `X-Total` header and attaches it to the returned array as a
 * non-enumerable `total` property (read via {@link getTotal}).
 */
export const executeFetchPaginated = async <T>(url: string, options: RequestInit): Promise<T> => {
  const token = await getAuthToken();

  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  } catch (networkError) {
    throw buildApiError({ cause: networkError });
  }

  const contentType = response.headers.get("content-type") ?? "";
  let parsed: unknown = undefined;
  let rawBody: string | undefined;
  if (contentType.includes("application/json")) {
    try {
      parsed = await response.json();
    } catch (parseError) {
      throw buildApiError({ status: response.status, rawBody, cause: parseError });
    }
  } else {
    try {
      rawBody = await response.text();
    } catch {
      /* ignore */
    }
  }

  if (!response.ok) {
    throw buildApiError({ status: response.status, body: parsed, rawBody });
  }

  const value = (Array.isArray(parsed) ? parsed : []) as unknown[];
  Object.defineProperty(value, "total", {
    value: Number(response.headers.get("X-Total")) || 0,
    enumerable: false,
    configurable: true,
    writable: true,
  });
  return value as T;
};
