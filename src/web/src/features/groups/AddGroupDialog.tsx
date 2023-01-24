import { AddGroupCommand } from "../../api/models";
import { useForm } from "react-hook-form";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import Button from "@mui/material/Button";
import { getListGroupsQueryKey, useAddGroup } from "../../api/endpoints/groups/groups";
import DialogContent from "@mui/material/DialogContent/DialogContent";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import Dialog from "@mui/material/Dialog/Dialog";
import DialogContentText from "@mui/material/DialogContentText/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle/DialogTitle";
import NiceModal, { useModal, muiDialogV5 } from "@ebay/nice-modal-react";
import { useQueryClient } from "react-query";

export const AddGroupDialog = NiceModal.create(() => {
  const modal = useModal();
  const { mutateAsync } = useAddGroup();
  const queryClient = useQueryClient();
  const formContext = useForm<AddGroupCommand>();
  const { handleSubmit, reset, setError } = formContext;

  const handleOnCancelClick = () => {
    reset();
    modal.remove();
  };

  const onSubmit = (data: AddGroupCommand) => {
    mutateAsync({ data: data }, { onSuccess: onSuccess, onError: onError });
  };

  const onSuccess = () => {
    queryClient.invalidateQueries(getListGroupsQueryKey());
    reset();
    modal.remove();
  };

  const onError = (error: any) => {
    error.response.data.errors.forEach((propertyError: any) => {
      setError(propertyError.property, {
        type: "server",
        message: propertyError.title,
      });
    });
  };

  return (
    <Dialog {...muiDialogV5(modal)}>
      <DialogTitle>Groep toevoegen</DialogTitle>
      <DialogContent>
        <DialogContentText>To add a group, please enter the group name here.</DialogContentText>
        <FormContainer formContext={formContext} handleSubmit={handleSubmit(onSubmit)}>
          <TextFieldElement
            autoFocus
            name="name"
            label="Naam"
            margin="dense"
            variant="standard"
            fullWidth
          />
        </FormContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOnCancelClick}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit, onError)}>Toevoegen</Button>
      </DialogActions>
    </Dialog>
  );
});
