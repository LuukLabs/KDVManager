import { Form, FormTextField, FormDatePicker, useMutationErrorHandler } from "@components/forms";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import NiceModal, { muiDialogV5, useModal } from "@ebay/nice-modal-react";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useAddEndMark, getListEndMarksQueryKey } from "@api/scheduling/endpoints/end-marks/end-marks";
import { getGetChildSchedulesQueryKey } from "@api/scheduling/endpoints/schedules/schedules";
import { useQueryClient } from "@tanstack/react-query";

type AddEndMarkDialogProps = {
  childId: string;
};

type FormValues = {
  endDate: string;
  reason: string;
};

export const AddEndMarkDialog = NiceModal.create<AddEndMarkDialogProps>(({ childId }) => {
  const { t } = useTranslation();
  const modal = useModal();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const formContext = useForm<FormValues>({
    defaultValues: {
      endDate: dayjs().format("YYYY-MM-DD"),
      reason: "",
    },
    mode: "onChange",
  });
  const {
    handleSubmit,
    reset,
    setError,
    formState: { isValid, isDirty, isSubmitting },
  } = formContext;
  const addEndMarkMutation = useAddEndMark();

  const handleOnCancelClick = () => {
    modal.remove();
    reset();
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await addEndMarkMutation.mutateAsync(
      {
        data: {
          childId,
          endDate: data.endDate,
          reason: data.reason || undefined,
        },
      },
      {
        onSuccess: onMutateSuccess,
        onError: onMutateError,
      },
    );
  };

  const onMutateSuccess = () => {
    enqueueSnackbar(t("End mark added"), { variant: "success" });
    void queryClient.invalidateQueries({ queryKey: getListEndMarksQueryKey({ childId }) });
    void queryClient.invalidateQueries({ queryKey: getGetChildSchedulesQueryKey({ childId }) });
    modal.remove();
    reset();
  };

  const onMutateError = useMutationErrorHandler({ setError });

  return (
    <Dialog {...muiDialogV5(modal)} maxWidth="xs" fullWidth>
      <DialogTitle>{t("Add End Mark")}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2, color: "text.secondary", fontSize: "0.875rem" }}>
          {t(
            "Set the last day this child's schedule is active. Anything scheduled after this date is removed.",
          )}
        </DialogContentText>
        <Form formContext={formContext} onSubmit={onSubmit}>
          <FormDatePicker
            label={t("End Date")}
            name="endDate"
            slotProps={{ textField: { size: "small", fullWidth: true } }}
            transform={{
              output: (value) => (value ? value.format("YYYY-MM-DD") : null),
            }}
          />
          <FormTextField
            name="reason"
            label={t("Reason (optional)")}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
          />
        </Form>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleOnCancelClick}>
          {t("Cancel", { ns: "common" })}
        </Button>
        <Button
          variant="contained"
          color="warning"
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
