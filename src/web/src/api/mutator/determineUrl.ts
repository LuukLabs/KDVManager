import { BASE_URL } from "../constants";

export const determineUrl = (url: string, params?: Record<string, any>): string => {
  if (params) {
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === "") continue; // skip empty params
      cleaned[k] = String(v);
    }
    const queryParams = new URLSearchParams(cleaned);
    const qs = queryParams.toString();
    if (qs) return `${BASE_URL}${url}?${qs}`;
  }
  return `${BASE_URL}${url}`;
};
