import { type AddTenantCommand } from "@api/tenants/models/addTenantCommand";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Form, FormTextField, useMutationErrorHandler } from "@components/forms";
import Button from "@mui/material/Button";
import { getListTenantsQueryKey, useAddTenant } from "@api/tenants/endpoints/tenants/tenants";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import NiceModal, { muiDialogV5, useModal } from "@ebay/nice-modal-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";

export const AddTenantDialog = NiceModal.create(() => {
  const { t } = useTranslation();
  const modal = useModal();
  const mutate = useAddTenant();
  const queryClient = useQueryClient();
  const formContext = useForm<AddTenantCommand>();

  const {
    handleSubmit,
    reset,
    setError,
    formState: { isValid, isDirty, isSubmitting },
  } = formContext;
  const { enqueueSnackbar } = useSnackbar();

  const handleOnCancelClick = () => {
    modal.remove();
    reset();
  };

  const onSubmit: SubmitHandler<AddTenantCommand> = async (data) => {
    await mutate.mutateAsync(
      { data: data },
      { onSuccess: onMutateSuccess, onError: onMutateError },
    );
  };

  const onMutateSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getListTenantsQueryKey() });
    modal.remove();
    enqueueSnackbar(t("Tenant added"), { variant: "success" });
    reset();
  };

  const onMutateError = useMutationErrorHandler({ setError });

  return (
    <Dialog {...muiDialogV5(modal)}>
      <DialogTitle>{t("Add tenant")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("To add a tenant, please enter the tenant name here.")}
        </DialogContentText>
        <Form formContext={formContext} onSubmit={onSubmit}>
          <FormTextField
            autoFocus
            name="name"
            label={t("Name")}
            margin="dense"
            variant="standard"
            autoComplete="off"
            fullWidth
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
