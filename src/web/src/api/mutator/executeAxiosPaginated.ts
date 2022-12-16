import Axios, { AxiosRequestConfig } from "axios";
import { BASE_URL } from "../constants";

export const AXIOS_INSTANCE = Axios.create({ baseURL: BASE_URL });

export type ListRecord<RecordType> = {
  value: RecordType;
  meta: RequestMeta;
};

export type RequestMeta = {
  total?: number;
};

export const executeAxiosPaginated = <T>(
  config: AxiosRequestConfig
): Promise<ListRecord<T>> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    cancelToken: source.token,
  }).then(({ data, headers }) => {
    return {
      value: data,
      meta: {
        total: Number(headers["x-total"]),
      },
    };
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled by React Query");
  };

  return promise;
};
