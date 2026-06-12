import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  Stack,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { Form } from "@components/forms/Form";
import { FormTextField } from "@components/forms/FormTextField";
import {
  useInviteAdministrator,
  getListAdministratorsQueryKey,
} from "@api/crm/endpoints/administrators/administrators";
import { ApiError } from "@api/errors/types";

type InviteAdministratorDialogProps = {
  open: boolean;
  onClose: () => void;
};

type InviteAdministratorFormData = {
  email: string;
};

export const InviteAdministratorDialog = ({ open, onClose }: InviteAdministratorDialogProps) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const inviteAdministrator = useInviteAdministrator();

  const formContext = useForm<InviteAdministratorFormData>({
    defaultValues: { email: "" },
  });

  const handleClose = () => {
    setError(null);
    formContext.reset({ email: "" });
    onClose();
  };

  const onSubmit = async (data: InviteAdministratorFormData) => {
    try {
      setError(null);
      await inviteAdministrator.mutateAsync({ data: { email: data.email.trim() } });
      await queryClient.invalidateQueries({ queryKey: getListAdministratorsQueryKey() });
      handleClose();
    } catch (err) {
      if (err instanceof ApiError && err.type === "conflict") {
        setError(t("This person is already an administrator or has a pending invitation."));
      } else {
        setError(t("Failed to send invitation. Please try again."));
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Form formContext={formContext} onSubmit={onSubmit}>
        <DialogTitle>{t("Invite administrator")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <DialogContentText>
              {t(
                "Enter the email address of the person you want to invite. They will receive an email to set up their account.",
              )}
            </DialogContentText>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            <FormTextField<InviteAdministratorFormData>
              name="email"
              label={t("Email")}
              type="email"
              fullWidth
              required
              autoFocus
              rules={{
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t("Please enter a valid email address"),
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("Cancel")}</Button>
          <Button type="submit" variant="contained" disabled={inviteAdministrator.isPending}>
            {inviteAdministrator.isPending ? t("Sending...") : t("Send invitation")}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
};
