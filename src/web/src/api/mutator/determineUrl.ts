import { BASE_URL } from "../constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const determineUrl = (url: string, params?: object): string => {
  if (params) {
    const queryParams = new URLSearchParams({ ...params });

    if (queryParams.toString()) {
      return `${BASE_URL}${url}?${queryParams.toString()}`;
    }
  }

  return `${BASE_URL}${url}`;
};
