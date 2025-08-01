import { type DeleteTexts } from "../types/delete.types";

type ApiError = {
  readonly status?: number;
  readonly response?: {
    readonly status?: number;
  };
};

export const getErrorStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== "object") return undefined;
  const apiError = error as ApiError;
  return apiError.status ?? apiError.response?.status;
};

export const createErrorHandler =
  (
    texts: DeleteTexts,
    enqueueSnackbar: (message: string, options: { variant: "error" | "warning" }) => void,
  ) =>
  (error: unknown): void => {
    const status = getErrorStatus(error);
    const { errors } = texts;

    if (status === 409) {
      enqueueSnackbar(errors.conflict, { variant: "warning" });
    } else if (status === 404) {
      enqueueSnackbar(errors.notFound, { variant: "error" });
    } else {
      enqueueSnackbar(errors.unknown, { variant: "error" });
    }
  };
