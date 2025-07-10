import { type RequestConfig } from "./requestConfig";
import { determineUrl } from "./determineUrl";
import { authInterceptor } from "../interceptors/authInterceptor";
import { authErrorHandler } from "../interceptors/authErrorHandler";

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

  const fetchConfig = {
    url: determineUrl(url, params),
    headers: {
      ...headers,
    },
    method: method.toUpperCase(),
    signal,
    ...(data ? { body: JSON.stringify(data) } : {}),
  };

  // Apply auth interceptor
  const configWithAuth = await authInterceptor.intercept(fetchConfig);

  const response = await fetch(configWithAuth.url, {
    headers: configWithAuth.headers,
    method: configWithAuth.method,
    signal: configWithAuth.signal,
    body: configWithAuth.body,
  });

  // Handle authentication errors
  if (authErrorHandler.shouldHandleError(response)) {
    await authErrorHandler.handleAuthError(response);
    // Return a rejected promise with auth error info
    return Promise.reject({
      status: 401,
      message: "Authentication required",
      redirected: true,
    });
  }

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
