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
import { useDeleteGuardian } from "@api/endpoints/guardians/guardians";

type DeleteGuardianButtonProps = {
  id: string;
  displayName: string;
};

export const DeleteGuardianButton = ({ id, displayName }: DeleteGuardianButtonProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();
  const deleteGuardian = useDeleteGuardian();

  const handleDelete = async () => {
    try {
      setError(null);
      await deleteGuardian.mutateAsync({ id });
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["guardians"] });
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch {
      setError(
        t("Failed to delete guardian. Please ensure all child relationships are removed first."),
      );
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setSuccess(false);
  };

  return (
    <>
      <Tooltip title={t("Delete Guardian")}>
        <IconButton size="small" onClick={() => setOpen(true)} color="error">
          <Delete fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{t("Delete Guardian")}</DialogTitle>
        <DialogContent>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('Guardian "{{displayName}}" has been deleted successfully.', { displayName })}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <DialogContentText>
            {t(
              'Are you sure you want to delete "{{displayName}}"? This action cannot be undone. Please ensure all child relationships are removed before deleting.',
              { displayName },
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("Cancel")}</Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={deleteGuardian.isPending || success}
          >
            {deleteGuardian.isPending ? t("Deleting...") : t("Delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
