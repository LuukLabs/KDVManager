import { type SubmitHandler, useForm } from "react-hook-form";
import { Form, FormTextField, FormTimeField, useMutationErrorHandler } from "@components/forms";
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
import {
  getListTimeSlotsQueryKey,
  useUpdateTimeSlot,
} from "@api/scheduling/endpoints/time-slots/time-slots";
import { type UpdateTimeSlotCommand } from "@api/scheduling/models/updateTimeSlotCommand";
import { type TimeSlotListVM } from "@api/scheduling/models/timeSlotListVM";
import dayjs from "dayjs";

type EditTimeSlotDialogProps = {
  timeSlot: TimeSlotListVM;
};

const EditTimeSlotDialog = NiceModal.create<EditTimeSlotDialogProps>(({ timeSlot }) => {
  const { t } = useTranslation();
  const modal = useModal();
  const mutate = useUpdateTimeSlot();
  const queryClient = useQueryClient();

  const formContext = useForm<UpdateTimeSlotCommand>({
    defaultValues: {
      id: timeSlot.id,
      name: timeSlot.name,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
    },
    mode: "onChange",
  });

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

  const onSubmit: SubmitHandler<UpdateTimeSlotCommand> = async (data) => {
    await mutate.mutateAsync(
      { id: timeSlot.id!, data: data },
      { onSuccess: onMutateSuccess, onError: onMutateError },
    );
  };

  const onMutateSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getListTimeSlotsQueryKey() });
    modal.remove();
    enqueueSnackbar(t("Time slot updated"), { variant: "success" });
    reset();
  };

  const onMutateError = useMutationErrorHandler({
    setError,
    fallbackMessage: t("Failed to update time slot"),
  });

  return (
    <Dialog {...muiDialogV5(modal)}>
      <DialogTitle>{t("Edit time slot")}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t("Update the time slot details below.")}</DialogContentText>
        <Form formContext={formContext} onSubmit={onSubmit}>
          <FormTextField
            autoFocus
            name="name"
            label={t("Name")}
            margin="dense"
            variant="standard"
            autoComplete="off"
            fullWidth
            rules={{
              required: t("Name is required"),
              minLength: {
                value: 2,
                message: t("Name must be at least 2 characters"),
              },
              maxLength: {
                value: 25,
                message: t("Name must not exceed 25 characters"),
              },
            }}
          />
          <FormTimeField
            name="startTime"
            label={t("Start time")}
            variant="standard"
            fullWidth
            rules={{ required: t("Start time is required") }}
          />
          <FormTimeField
            name="endTime"
            label={t("End time")}
            variant="standard"
            fullWidth
            rules={{
              required: t("End time is required"),
              validate: (value, formValues) => {
                if (!value || !formValues.startTime) return true;
                const startTime = dayjs(formValues.startTime, "HH:mm:ss");
                const endTime = dayjs(value, "HH:mm:ss");
                return endTime.isAfter(startTime) || t("End time must be after start time");
              },
            }}
          />
        </Form>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleOnCancelClick}>
          {t("Cancel", { ns: "common" })}
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={!isValid || !isDirty || isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          {t("Update")}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default EditTimeSlotDialog;
