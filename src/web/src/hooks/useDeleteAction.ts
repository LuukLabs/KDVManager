import { useCallback, useMemo } from "react";
import { useSnackbar } from "notistack";
import NiceModal from "@ebay/nice-modal-react";
import { DeleteConfirmationModal } from "@components/delete/DeleteConfirmationModal";
import { type DeleteConfig, type DeleteMutation } from "../types/delete.types";
import { createErrorHandler } from "../utils/error-handler";

type UseDeleteActionOptions<
  TData = void,
  TError = unknown,
  TVariables extends Record<string, unknown> = { id: string },
> = {
  readonly mutation: DeleteMutation<TData, TError, TVariables>;
  readonly config: DeleteConfig;
};

type UseDeleteActionReturn<
  TData = void,
  TError = unknown,
  TVariables extends Record<string, unknown> = { id: string },
> = {
  readonly openConfirmation: () => void;
  readonly isDeleting: boolean;
  readonly mutation: DeleteMutation<TData, TError, TVariables>;
};

export const useDeleteAction = <
  TData = void,
  TError = unknown,
  TVariables extends Record<string, unknown> = { id: string },
>({
  mutation,
  config,
}: UseDeleteActionOptions<TData, TError, TVariables>): UseDeleteActionReturn<
  TData,
  TError,
  TVariables
> => {
  const { enqueueSnackbar } = useSnackbar();

  const handleDefaultError = useMemo(
    () => createErrorHandler(config.texts, enqueueSnackbar),
    [config.texts, enqueueSnackbar],
  );

  const executeDelete = useCallback(async (): Promise<void> => {
    try {
      const variables = { id: config.id } as unknown as TVariables;
      await mutation.mutateAsync(variables);

      enqueueSnackbar(config.texts.success, { variant: "success" });
      await config.onSuccess?.();
      NiceModal.hide(DeleteConfirmationModal);
    } catch (error) {
      try {
        if (config.onError) {
          await config.onError(error);
        } else {
          handleDefaultError(error);
        }
      } finally {
        NiceModal.hide(DeleteConfirmationModal);
      }
    }
  }, [mutation, config, enqueueSnackbar, handleDefaultError]);

  const openConfirmation = useCallback((): void => {
    NiceModal.show(DeleteConfirmationModal, {
      title: config.texts.confirmation.title,
      message: config.texts.confirmation.message,
      cancelButton: config.texts.confirmation.cancelButton,
      deleteButton: config.texts.confirmation.deleteButton,
      deletingButton: config.texts.confirmation.deletingButton,
      isDeleting: mutation.isPending,
      onConfirm: executeDelete,
    });
  }, [config.texts, mutation.isPending, executeDelete]);

  return {
    openConfirmation,
    isDeleting: mutation.isPending,
    mutation,
  };
};
