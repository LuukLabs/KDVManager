import i18next from "i18next";
import { ApiError } from "./types";

export const classifyStatus = (status?: number): ApiError["type"] => {
  if (!status) return "unknown";
  if (status >= 500) return "server";
  switch (status) {
    case 400:
      return "bad-request";
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not-found";
    case 408:
      return "timeout";
    case 409:
      return "conflict";
    case 422:
      return "validation";
    default:
      return status >= 400 && status < 500 ? "unknown" : "unknown";
  }
};

export const buildApiError = (params: {
  status?: number;
  body?: any; // parsed JSON if available
  rawBody?: string;
  cause?: unknown;
}): ApiError => {
  const { status, body, rawBody, cause } = params;

  const messageFromBody = body
    ? (body.message ?? body.title ?? body.error ?? body.detail)
    : undefined;
  const message =
    messageFromBody ??
    (status === 404
      ? i18next.t("error.notFound", "Resource not found")
      : status === 401
        ? i18next.t("error.unauthorized", "Unauthorized")
        : status === 403
          ? i18next.t("error.forbidden", "Forbidden")
          : status === 409
            ? i18next.t("error.conflict", "Conflict")
            : status && status >= 500
              ? i18next.t("error.server", "Server error")
              : i18next.t("error.unexpected", "Unexpected error"));

  const code = body?.code;
  const details = body?.errors ?? body?.details ?? body?.Extensions ?? body;

  return new ApiError({
    message,
    status,
    code,
    details,
    rawBody,
    cause,
    type:
      cause instanceof DOMException && cause.name === "AbortError"
        ? "aborted"
        : classifyStatus(status),
  });
};
