import { useAuth0 } from "@auth0/auth0-react";
import Axios, { AxiosRequestConfig } from "axios";
import { BASE_URL } from "../constants";

const AXIOS_INSTANCE = Axios.create({ baseURL: BASE_URL });

export const useExecuteAxios = <T>(): ((config: AxiosRequestConfig) => Promise<T>) => {
  const { getAccessTokenSilently } = useAuth0();

  return (config: AxiosRequestConfig) => {
    const source = Axios.CancelToken.source();
    const promise = getAccessTokenSilently({
      audience: "https://api.kdvmanager.nl/",
    }).then((accessToken) =>
      AXIOS_INSTANCE({
        ...config,
        cancelToken: source.token,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...config.headers,
        },
      }).then(({ data }) => data)
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    promise.cancel = () => {
      source.cancel("Query was cancelled by React Query");
    };

    return promise;
  };
};
