export type ApiErrorShape = {
  status?: number; // HTTP status code if available
  code?: string; // Optional machine readable application error code
  message: string; // Human readable message (fallback generic if absent)
  details?: unknown; // Extra payload from server
  rawBody?: string; // Original body text when not JSON
  cause?: unknown; // Underlying error (network, parse, etc.)
  type: ErrorClassification;
};

export type ErrorClassification =
  | "network"
  | "timeout"
  | "aborted"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "conflict"
  | "validation"
  | "server"
  | "bad-request"
  | "parse"
  | "unknown";

export class ApiError extends Error implements ApiErrorShape {
  status?: number;
  code?: string;
  details?: unknown;
  rawBody?: string;
  cause?: unknown;
  type: ErrorClassification = "unknown";

  constructor(init: Partial<ApiErrorShape> & { message: string }) {
    super(init.message);
    Object.assign(this, init);
    this.name = "ApiError";
  }
}
