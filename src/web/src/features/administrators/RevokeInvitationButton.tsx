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
import { Cancel } from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import {
  useRevokeInvitation,
  getListAdministratorsQueryKey,
} from "@api/crm/endpoints/administrators/administrators";

type RevokeInvitationButtonProps = {
  invitationId: string;
  email: string;
};

export const RevokeInvitationButton = ({ invitationId, email }: RevokeInvitationButtonProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const revokeInvitation = useRevokeInvitation();

  const handleRevoke = async () => {
    try {
      setError(null);
      await revokeInvitation.mutateAsync({ invitationId });
      await queryClient.invalidateQueries({ queryKey: getListAdministratorsQueryKey() });
      setOpen(false);
    } catch {
      setError(t("Failed to revoke invitation. Please try again."));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  return (
    <>
      <Tooltip title={t("Revoke invitation")}>
        <IconButton onClick={() => setOpen(true)}>
          <Cancel />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{t("Revoke invitation")}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <DialogContentText>
            {t('Are you sure you want to revoke the invitation for "{{email}}"?', { email })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("Cancel")}</Button>
          <Button onClick={handleRevoke} color="error" disabled={revokeInvitation.isPending}>
            {revokeInvitation.isPending ? t("Revoking...") : t("Revoke")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
