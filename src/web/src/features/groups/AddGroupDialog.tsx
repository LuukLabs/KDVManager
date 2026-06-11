import { type AddGroupCommand } from "@api/scheduling/models/addGroupCommand";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Form, FormTextField } from "@components/forms";
import Button from "@mui/material/Button";
import { getListGroupsQueryKey, useAddGroup } from "@api/scheduling/endpoints/groups/groups";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import NiceModal, { muiDialogV5, useModal } from "@ebay/nice-modal-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { type UnprocessableEntityResponse } from "@api/scheduling/models/unprocessableEntityResponse";

export const AddGroupDialog = NiceModal.create(() => {
  const { t } = useTranslation();
  const modal = useModal();
  const mutate = useAddGroup();
  const queryClient = useQueryClient();
  const formContext = useForm<AddGroupCommand>();

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

  const onSubmit: SubmitHandler<AddGroupCommand> = async (data) => {
    await mutate.mutateAsync(
      { data: data },
      { onSuccess: onMutateSuccess, onError: onMutateError },
    );
  };

  const onMutateSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
    modal.remove();
    enqueueSnackbar(t("Group added"), { variant: "success" });
    reset();
  };

  const onMutateError = (error: UnprocessableEntityResponse) => {
    if (Array.isArray(error?.errors)) {
      error.errors.forEach((propertyError) => {
        setError(propertyError.property as any, {
          type: "server",
          message: propertyError.title,
        });
      });
    } else {
      enqueueSnackbar(t("Failed to add group"), { variant: "error" });
    }
  };

  return (
    <Dialog {...muiDialogV5(modal)}>
      <DialogTitle>{t("Add group")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("To add a group, please enter the group name here.")}
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
