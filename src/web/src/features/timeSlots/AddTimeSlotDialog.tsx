import { type SubmitHandler, useForm } from "react-hook-form";
import { Form, FormTextField, FormTimeField } from "@components/forms";
import Button from "@mui/material/Button";
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
import {
  getListTimeSlotsQueryKey,
  useAddTimeSlot,
} from "@api/scheduling/endpoints/time-slots/time-slots";
import { type AddTimeSlotCommand } from "@api/scheduling/models/addTimeSlotCommand";

export const AddTimeSlotDialog = NiceModal.create(() => {
  const { t } = useTranslation();
  const modal = useModal();
  const mutate = useAddTimeSlot();
  const queryClient = useQueryClient();
  const formContext = useForm<AddTimeSlotCommand>();

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

  const onSubmit: SubmitHandler<AddTimeSlotCommand> = async (data) => {
    await mutate.mutateAsync(
      { data: data },
      { onSuccess: onMutateSuccess, onError: onMutateError },
    );
  };

  const onMutateSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getListTimeSlotsQueryKey() });
    modal.remove();
    enqueueSnackbar(t("Time slot added"), { variant: "success" });
    reset();
  };

  const onMutateError = (error: UnprocessableEntityResponse) => {
    error.errors.forEach((propertyError) => {
      setError(propertyError.property as any, {
        type: "server",
        message: propertyError.title,
      });
    });
  };

  return (
    <Dialog {...muiDialogV5(modal)}>
      <DialogTitle>{t("Add time slot")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("To add a time slot, please specify the name here and start and end times.")}
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
          <FormTimeField
            name="startTime"
            label={t("Start time")}
            variant="standard"
            fullWidth
          />
          <FormTimeField
            name="endTime"
            label={t("End time")}
            variant="standard"
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
