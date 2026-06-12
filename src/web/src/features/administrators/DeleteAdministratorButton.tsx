import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDeleteAdministrator,
  getListAdministratorsQueryKey,
} from "@api/crm/endpoints/administrators/administrators";

type DeleteAdministratorButtonProps = {
  userId: string;
  email: string;
  /** Disable deletion (e.g. for the currently signed-in administrator). */
  disabled?: boolean;
};

export const DeleteAdministratorButton = ({
  userId,
  email,
  disabled,
}: DeleteAdministratorButtonProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const deleteAdministrator = useDeleteAdministrator();

  const handleDelete = async () => {
    try {
      setError(null);
      await deleteAdministrator.mutateAsync({ userId });
      await queryClient.invalidateQueries({ queryKey: getListAdministratorsQueryKey() });
      setOpen(false);
    } catch {
      setError(t("Failed to delete administrator. Please try again."));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  return (
    <>
      <Tooltip
        title={
          disabled ? t("You cannot delete your own account") : t("Delete administrator")
        }
      >
        <span>
          <IconButton onClick={() => setOpen(true)} disabled={disabled}>
            <Delete />
          </IconButton>
        </span>
      </Tooltip>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{t("Delete administrator")}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <DialogContentText>
            {t(
              'Are you sure you want to permanently delete the administrator "{{email}}"? This deletes their account and cannot be undone.',
              { email },
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("Cancel")}</Button>
          <Button onClick={handleDelete} color="error" disabled={deleteAdministrator.isPending}>
            {deleteAdministrator.isPending ? t("Deleting...") : t("Delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
