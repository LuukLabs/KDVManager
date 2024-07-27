import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent/DialogContent";
import DialogActions from "@mui/material/DialogActions/DialogActions";
import Dialog from "@mui/material/Dialog/Dialog";
import DialogContentText from "@mui/material/DialogContentText/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle/DialogTitle";
import NiceModal, { muiDialogV5, useModal } from "@ebay/nice-modal-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { type UnprocessableEntityResponse } from "@api/models/unprocessableEntityResponse";
import { getListTimeSlotsQueryKey, useAddTimeSlot } from "@api/endpoints/time-slots/time-slots";
import { type AddTimeSlotCommand } from "@api/models/addTimeSlotCommand";
import { TimeField } from "@mui/x-date-pickers/TimeField";
import LoadingButton from "@mui/lab/LoadingButton";
import dayjs from "dayjs";

export const AddTimeSlotDialog = NiceModal.create(() => {
  const { t } = useTranslation();
  const modal = useModal();
  const mutate = useAddTimeSlot();
  const queryClient = useQueryClient();
  const formContext = useForm<AddTimeSlotCommand>();

  const {
    control,
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
        <FormContainer formContext={formContext} handleSubmit={handleSubmit(onSubmit)}>
          <TextFieldElement
            autoFocus
            name="name"
            label={t("Name")}
            margin="dense"
            variant="standard"
            autoComplete="off"
            fullWidth
          />
          <Controller
            control={control}
            name="startTime"
            render={({ field }) => (
              <TimeField
                label={t("Start time")}
                defaultValue={field.value ? dayjs(field.value) : undefined}
                inputRef={field.ref}
                format="HH:mm"
                variant="standard"
                onChange={(date) => {
                  field.onChange(date?.format("HH:mm:ss"));
                }}
                fullWidth
              />
            )}
          />
          <Controller
            control={control}
            name="endTime"
            render={({ field }) => (
              <TimeField
                label={t("End time")}
                defaultValue={field.value ? dayjs(field.value) : undefined}
                inputRef={field.ref}
                format="HH:mm"
                variant="standard"
                onChange={(date) => {
                  field.onChange(date?.format("HH:mm:ss"));
                }}
                fullWidth
              />
            )}
          />
        </FormContainer>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleOnCancelClick}>
          {t("Cancel", { ns: "common" })}
        </Button>
        <LoadingButton
          variant="contained"
          disabled={!isDirty || !isValid}
          loading={isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          <span>{t("Add", { ns: "common" })}</span>
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});
