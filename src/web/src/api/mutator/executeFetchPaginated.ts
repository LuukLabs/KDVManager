import { type RequestConfig } from "./requestConfig";
import { determineUrl } from "./determineUrl";
import { getAuthToken } from "@lib/auth/auth";

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

  const response = await fetch(fetchUrl, {
    headers: fetchHeaders,
    signal,
    method,
    ...(data ? { body: JSON.stringify(data) } : {}),
  });

  const json = (await response.json()) as T;

  if (!response.ok) {
    return Promise.reject(json);
  }

  return {
    value: json,
    meta: {
      total: Number(response.headers.get("X-Total")),
    },
  };
};
