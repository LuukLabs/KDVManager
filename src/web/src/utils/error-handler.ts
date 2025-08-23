import { type DeleteTexts } from "../types/delete.types";
import { ApiError } from "@api/errors/types";
import { classifyStatus } from "@api/errors/classify";

export const getErrorStatus = (error: unknown): number | undefined => {
  if (!error) return undefined;
  if (error instanceof ApiError) return error.status;
  if (typeof error === "object" && "status" in (error as any)) return (error as any).status;
  return undefined;
};

export const createErrorHandler = (
  texts: DeleteTexts,
  enqueueSnackbar: (message: string, options: { variant: "error" | "warning" }) => void,
) =>
  (error: unknown): void => {
    let apiError: ApiError;
    if (error instanceof ApiError) {
      apiError = error;
    } else {
      const status = getErrorStatus(error);
      apiError = new ApiError({ message: "Unexpected error", status, type: classifyStatus(status) });
    }

    const { errors } = texts;
    switch (apiError.type) {
      case "conflict":
        enqueueSnackbar(errors.conflict, { variant: "warning" });
        break;
      case "not-found":
        enqueueSnackbar(errors.notFound, { variant: "error" });
        break;
      default:
        enqueueSnackbar(errors.unknown, { variant: "error" });
        break;
    }
  };
