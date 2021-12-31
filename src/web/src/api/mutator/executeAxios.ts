import Axios, { AxiosRequestConfig } from "axios";
import { BASE_URL } from "../constants";

export const AXIOS_INSTANCE = Axios.create({ baseURL: BASE_URL });

export const executeAxios = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled by React Query");
  };

  return promise;
};
