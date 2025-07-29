import NiceModal, { useModal } from "@ebay/nice-modal-react";
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
} from "@api/endpoints/closure-periods/closure-periods";
import { useQueryClient } from "@tanstack/react-query";
import type { UnprocessableEntityResponse } from "@api/models/unprocessableEntityResponse";
import type { AddClosurePeriodCommand } from "@api/models/addClosurePeriodCommand";
import { DatePickerElement } from "react-hook-form-mui/date-pickers";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";

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

  const onSubmit = async (data: AddClosurePeriodCommand) => {
    await mutate.mutateAsync(
      { data },
      {
        onSuccess: onMutateSuccess,
        onError: (error: unknown) => {
          // Try to cast error to UnprocessableEntityResponse
          const entityError = error as UnprocessableEntityResponse;
          if (entityError?.errors) {
            entityError.errors.forEach((propertyError) => {
              setError(propertyError.property as any, {
                type: "server",
                message: propertyError.title,
              });
            });
          } else {
            enqueueSnackbar(t("Failed to add closure period"), { variant: "error" });
          }
        },
      },
    );
  };

  const onMutateSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getListClosurePeriodsQueryKey() });
    modal.remove();
    enqueueSnackbar(t("Closure period added"), { variant: "success" });
    reset();
  };

  return (
    <Dialog open={modal.visible} onClose={modal.hide}>
      <DialogTitle>{t("Add Closure Period")}</DialogTitle>

      <DialogContent>
        <FormContainer formContext={formContext} handleSubmit={handleSubmit(onSubmit)}>
          <TextFieldElement name="reason" label={t("Reason")} fullWidth margin="normal" />
          <DatePickerElement
            label={t("Start Date")}
            name="startDate"
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
              },
            }}
            transform={{
              output: (value) => {
                return value ? value.format("YYYY-MM-DD") : null;
              },
            }}
          />
          <DatePickerElement
            label={t("End Date")}
            name="endDate"
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
              },
            }}
            transform={{
              output: (value) => {
                return value ? value.format("YYYY-MM-DD") : null;
              },
            }}
          />
        </FormContainer>
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
