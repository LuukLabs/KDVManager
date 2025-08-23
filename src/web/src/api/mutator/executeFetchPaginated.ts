import { type RequestConfig } from "./requestConfig";
import { determineUrl } from "./determineUrl";
import { getAuthToken } from "@lib/auth/auth";
import { buildApiError } from "../errors/classify";

export type ListRecord<RecordType> = {
  value: RecordType;
  meta: RequestMeta;
};

export type RequestMeta = {
  total?: number;
};

export const executeFetchPaginated = async <T>(
  requestConfig: RequestConfig,
): Promise<ListRecord<T>> => {
  const { data, method, params, url, signal, headers } = requestConfig;
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

  const contentType = response.headers.get("content-type") ?? "";
  let parsed: any = undefined;
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

  return {
    value: parsed as T,
    meta: {
      total: Number(response.headers.get("X-Total")),
    },
  };
};
