import NiceModal, { muiDialogV5, useModal } from "@ebay/nice-modal-react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import {
  useAddClosurePeriod,
  getListClosurePeriodsQueryKey,
} from "@api/scheduling/endpoints/closure-periods/closure-periods";
import { useQueryClient } from "@tanstack/react-query";
import type { AddClosurePeriodCommand } from "@api/scheduling/models/addClosurePeriodCommand";
import { Form, FormTextField, FormDatePicker, useMutationErrorHandler } from "@components/forms";

export const AddClosurePeriodDialog = NiceModal.create(() => {
  const modal = useModal();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const mutate = useAddClosurePeriod();
  const formContext = useForm<AddClosurePeriodCommand>();

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
    fallbackMessage: t("Failed to add closure period"),
  });

  const onSubmit = async (data: AddClosurePeriodCommand) => {
    await mutate.mutateAsync({ data }, { onSuccess: onMutateSuccess, onError: onMutateError });
  };

  const onMutateSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getListClosurePeriodsQueryKey() });
    modal.remove();
    enqueueSnackbar(t("Closure period added"), { variant: "success" });
    reset();
  };

  return (
    <Dialog {...muiDialogV5(modal)}>
      <DialogTitle>{t("Add Closure Period")}</DialogTitle>

      <DialogContent>
        <Form formContext={formContext} onSubmit={onSubmit}>
          <FormTextField name="reason" label={t("Reason")} fullWidth margin="normal" />
          <FormDatePicker
            label={t("Start Date")}
            name="startDate"
            slotProps={{ textField: { size: "small", fullWidth: true } }}
            transform={{
              output: (value) => (value ? value.format("YYYY-MM-DD") : null),
            }}
          />
          <FormDatePicker
            label={t("End Date")}
            name="endDate"
            slotProps={{ textField: { size: "small", fullWidth: true } }}
            transform={{
              output: (value) => (value ? value.format("YYYY-MM-DD") : null),
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
