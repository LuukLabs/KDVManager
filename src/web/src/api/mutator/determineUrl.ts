import { BASE_URL } from "../constants";

export const determineUrl = (url: string, params?: any): string => {
  if (params) {
    const queryParams = new URLSearchParams(params);

    if (queryParams.toString()) {
      return `${BASE_URL}${url}?${queryParams.toString()}`;
    }
  }

  return `${BASE_URL}${url}`;
};
