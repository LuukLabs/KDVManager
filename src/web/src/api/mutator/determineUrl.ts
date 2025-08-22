import { BASE_URL } from "../constants";

// Accept a loose object (like OpenAPI generated params) and coerce to query string
export const determineUrl = (url: string, params?: Record<string, unknown> | object): string => {
  if (params) {
    const cleanedEntries = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => [k, String(v)] as const);
    if (cleanedEntries.length > 0) {
      const queryParams = new URLSearchParams(cleanedEntries as unknown as string[][]);
      const qs = queryParams.toString();
      if (qs) {
        return `${BASE_URL}${url}?${qs}`;
      }
    }
  }
  return `${BASE_URL}${url}`;
};
