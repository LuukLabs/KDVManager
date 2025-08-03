export type RequestConfig = {
  url: string;
  headers?: HeadersInit;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  params?: Record<string, unknown>;
  data?: unknown;
  responseType?: string;
  signal?: AbortSignal;
};
