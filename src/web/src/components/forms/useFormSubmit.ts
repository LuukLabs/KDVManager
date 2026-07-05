import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { type TFunction } from "i18next";
import { type FieldValues, type UseFormSetError } from "react-hook-form";
import { applyServerValidationErrors } from "./serverValidation";

/** The one generic save-failure message every form falls back to. */
export const saveFailedMessage = (t: TFunction) =>
  t("form.errors.saveFailed", "An error occurred while saving. Please try again.");

type UseFormSubmitOptions<TFieldValues extends FieldValues> = {
  onSubmit: (data: TFieldValues) => Promise<void>;
  setError: UseFormSetError<TFieldValues>;
};

/**
 * Shared submit orchestration for full-page forms: runs `onSubmit`, maps
 * server-side validation errors onto their fields and keeps a generic submit
 * error for failures that aren't field-specific (render it with
 * FormErrorAlert).
 */
export const useFormSubmit = <TFieldValues extends FieldValues>({
  onSubmit,
  setError,
}: UseFormSubmitOptions<TFieldValues>) => {
  const { t } = useTranslation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: TFieldValues) => {
    setSubmitError(null);
    try {
      await onSubmit(data);
    } catch (error) {
      if (applyServerValidationErrors(error, setError)) return;
      setSubmitError(
        error instanceof Error && error.message ? error.message : saveFailedMessage(t),
      );
    }
  };

  const clearSubmitError = () => setSubmitError(null);

  return { handleSubmit, submitError, clearSubmitError };
};

type UseMutationErrorHandlerOptions<TFieldValues extends FieldValues> = {
  setError: UseFormSetError<TFieldValues>;
  /** Overrides the generic snackbar message for non-validation failures. */
  fallbackMessage?: string;
};

/**
 * Shared mutation `onError` handler for dialog forms: maps server-side
 * validation errors onto their fields and shows an error snackbar for
 * anything else.
 */
export const useMutationErrorHandler = <TFieldValues extends FieldValues>({
  setError,
  fallbackMessage,
}: UseMutationErrorHandlerOptions<TFieldValues>) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  return (error: unknown) => {
    if (!applyServerValidationErrors(error, setError)) {
      enqueueSnackbar(fallbackMessage ?? saveFailedMessage(t), { variant: "error" });
    }
  };
};
