import { useAuth0 } from "@auth0/auth0-react";
import { RequestConfig } from "./requestConfig";
import { determineUrl } from "./determineUrl";

export type ListRecord<RecordType> = {
  value: RecordType;
  meta: RequestMeta;
};

export type RequestMeta = {
  total?: number;
};

export const useExecuteFetchPaginated = <T>(): ((
  requestConfig: RequestConfig
) => Promise<ListRecord<T>>) => {
  const { getAccessTokenSilently } = useAuth0();

  return async ({
    data,
    method,
    params,
    url,
    signal,
    headers,
  }: RequestConfig): Promise<ListRecord<T>> => {
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
      method: method.toUpperCase(),
      signal,
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

    return {
      value: json as T,
      meta: {
        total: Number(response.headers.get("X-Total")),
      },
    };
  };
};
