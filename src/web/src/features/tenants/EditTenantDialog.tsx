import { type UpdateTenantCommand } from "@api/tenants/models/updateTenantCommand";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Form, FormTextField, useMutationErrorHandler } from "@components/forms";
import Button from "@mui/material/Button";
import { getListTenantsQueryKey, useUpdateTenant } from "@api/tenants/endpoints/tenants/tenants";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import NiceModal, { muiDialogV5, useModal } from "@ebay/nice-modal-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";

type EditTenantDialogProps = {
  id: string;
  name: string;
};

export const EditTenantDialog = NiceModal.create(({ id, name }: EditTenantDialogProps) => {
  const { t } = useTranslation();
  const modal = useModal();
  const mutate = useUpdateTenant();
  const queryClient = useQueryClient();
  const formContext = useForm<UpdateTenantCommand>({ defaultValues: { name } });

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

  const onSubmit: SubmitHandler<UpdateTenantCommand> = async (data) => {
    await mutate.mutateAsync(
      { id, data },
      { onSuccess: onMutateSuccess, onError: onMutateError },
    );
  };

  const onMutateSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getListTenantsQueryKey() });
    modal.remove();
    enqueueSnackbar(t("Tenant updated"), { variant: "success" });
  };

  const onMutateError = useMutationErrorHandler({ setError });

  return (
    <Dialog {...muiDialogV5(modal)}>
      <DialogTitle>{t("Edit tenant")}</DialogTitle>
      <DialogContent>
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
          <span>{t("Save", { ns: "common" })}</span>
        </Button>
      </DialogActions>
    </Dialog>
  );
});
