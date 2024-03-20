import { AddGroupCommand, UnprocessableEntityResponse } from "@api/models";
import { useForm, SubmitHandler } from "react-hook-form";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import Button from "@mui/material/Button";
import { getListGroupsQueryKey, useAddGroup } from "@api/endpoints/groups/groups";
import DialogContent from "@mui/material/DialogContent/DialogContent";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import Dialog from "@mui/material/Dialog/Dialog";
import DialogContentText from "@mui/material/DialogContentText/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle/DialogTitle";
import NiceModal, { useModal, muiDialogV5 } from "@ebay/nice-modal-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import LoadingButton from "@mui/lab/LoadingButton";

export const AddGroupDialog = NiceModal.create(() => {
  const { t } = useTranslation();
  const modal = useModal();
  const mutate = useAddGroup();
  const queryClient = useQueryClient();
  const formContext = useForm<AddGroupCommand>();
  const { handleSubmit, reset, setError } = formContext;

  const handleOnCancelClick = () => {
    reset();
    modal.remove();
  };

  const onSubmit: SubmitHandler<AddGroupCommand> = async (data) => {
    await mutate.mutateAsync({ data: data }, { onSuccess: onSuccess, onError: onError });
  };

  const onSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
    reset();
    modal.remove();
  };

  const onError = (error: UnprocessableEntityResponse) => {
    error.errors.forEach((propertyError) => {
      setError(propertyError.property, {
        type: "server",
        message: propertyError.title,
      });
    });
  };

  return (
    <Dialog {...muiDialogV5(modal)}>
      <DialogTitle>{t("Add group")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("To add a group, please enter the group name here.")}
        </DialogContentText>
        <FormContainer formContext={formContext} handleSubmit={handleSubmit(onSubmit)}>
          <TextFieldElement
            autoFocus
            name="name"
            label={t("Name")}
            margin="dense"
            variant="standard"
            fullWidth
          />
        </FormContainer>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleOnCancelClick}>
          {t("Cancel")}
        </Button>
        <LoadingButton
          variant="contained"
          loading={mutate.isPending}
          onClick={handleSubmit(onSubmit)}
        >
          <span>{t("Add")}</span>
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});
