export type RequestConfig = {
  url: string;
  headers?: HeadersInit;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  params?: object;
  data?: any;
  responseType?: string;
  signal?: AbortSignal;
};
