import React, { memo, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  type DialogProps,
} from "@mui/material";
import NiceModal, { useModal } from "@ebay/nice-modal-react";

type DeleteConfirmationModalProps = {
  readonly title: string;
  readonly message: string;
  readonly cancelButton: string;
  readonly deleteButton: string;
  readonly deletingButton: string;
  readonly isDeleting: boolean;
  readonly onConfirm: () => Promise<void> | void;
  readonly dialogProps?: Partial<DialogProps>;
};

export const DeleteConfirmationModal = NiceModal.create<DeleteConfirmationModalProps>(
  memo(
    ({
      title,
      message,
      cancelButton,
      deleteButton,
      deletingButton,
      isDeleting,
      onConfirm,
      dialogProps,
    }) => {
      const modal = useModal();

      const handleConfirm = useCallback(async () => {
        try {
          await onConfirm();
        } catch (error) {
          console.error("Delete confirmation error:", error);
          // Don't hide modal on error - let the hook handle it
        }
      }, [onConfirm]);

      const handleCancel = useCallback(() => {
        if (!isDeleting) {
          modal.hide();
        }
      }, [modal, isDeleting]);

      const handleClose = useCallback(
        (_event: object, reason: string) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            handleCancel();
          }
        },
        [handleCancel],
      );

      return (
        <Dialog
          open={modal.visible}
          onClose={handleClose}
          aria-labelledby="delete-confirmation-title"
          aria-describedby="delete-confirmation-description"
          disableEscapeKeyDown={isDeleting}
          {...dialogProps}
        >
          <DialogTitle id="delete-confirmation-title">{title}</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-confirmation-description">{message}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel} disabled={isDeleting}>
              {cancelButton}
            </Button>
            <Button
              onClick={handleConfirm}
              color="error"
              variant="contained"
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={16} /> : undefined}
            >
              {isDeleting ? deletingButton : deleteButton}
            </Button>
          </DialogActions>
        </Dialog>
      );
    },
  ),
);

DeleteConfirmationModal.displayName = "DeleteConfirmationModal";
