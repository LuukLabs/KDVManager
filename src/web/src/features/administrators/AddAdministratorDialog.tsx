import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import {
  useCreateAdministrator,
  getListAdministratorsQueryKey,
} from "@api/crm/endpoints/administrators/administrators";
import { useQueryClient } from "@tanstack/react-query";
import type { CreateAdministratorCommand } from "@api/crm/models/createAdministratorCommand";
import { Form, FormTextField, useMutationErrorHandler } from "@components/forms";

export const AddAdministratorDialog = NiceModal.create(() => {
  const modal = useModal();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const mutate = useCreateAdministrator();
  const formContext = useForm<CreateAdministratorCommand>();

  const {
    handleSubmit,
    reset,
    setError,
    formState: { isValid, isDirty, isSubmitting },
  } = formContext;

  const handleOnCancelClick = () => {
    modal.remove();
    reset();
  };

  const onMutateError = useMutationErrorHandler({
    setError,
    fallbackMessage: t("Failed to add administrator"),
  });

  const onMutateSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getListAdministratorsQueryKey() });
    modal.remove();
    enqueueSnackbar(t("Administrator added"), { variant: "success" });
    reset();
  };

  const onSubmit = async (data: CreateAdministratorCommand) => {
    await mutate.mutateAsync({ data }, { onSuccess: onMutateSuccess, onError: onMutateError });
  };

  return (
    <Dialog open={modal.visible} onClose={modal.hide}>
      <DialogTitle>{t("Add Administrator")}</DialogTitle>

      <DialogContent>
        <Form formContext={formContext} onSubmit={onSubmit}>
          <FormTextField name="name" label={t("Name")} fullWidth margin="normal" required />
          <FormTextField
            name="email"
            label={t("Email")}
            type="email"
            fullWidth
            margin="normal"
            required
          />
        </Form>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleOnCancelClick}>
          {t("Cancel", { ns: "common" })}
        </Button>
        <Button
          variant="contained"
          disabled={!isDirty || !isValid}
          loading={isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          <span>{t("Add", { ns: "common" })}</span>
        </Button>
      </DialogActions>
    </Dialog>
  );
});
