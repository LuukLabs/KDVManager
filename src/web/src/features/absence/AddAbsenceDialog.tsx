import { useState, useEffect } from "react";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import { FormControlLabel, Switch } from "@mui/material";
import NiceModal, { muiDialogV5, useModal } from "@ebay/nice-modal-react";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import { useForm, useWatch } from "react-hook-form";
import { useAddAbsence } from "@api/endpoints/absences/absences";
import { DatePickerElement } from "react-hook-form-mui/date-pickers";
import { useQueryClient } from "@tanstack/react-query";

type AddAbsenceDialogProps = {
  childId: string;
};

type FormValues = {
  startDate: string;
  endDate: string;
  reason: string;
};

export const AddAbsenceDialog = NiceModal.create<AddAbsenceDialogProps>(({ childId }) => {
  const { t } = useTranslation();
  const modal = useModal();
  const { enqueueSnackbar } = useSnackbar();
  const [multiDay, setMultiDay] = useState(false);
  const formContext = useForm<FormValues>({
    defaultValues: {
      startDate: dayjs().format("YYYY-MM-DD"),
      endDate: dayjs().format("YYYY-MM-DD"),
      reason: "",
    },
    mode: "onChange",
  });
  const queryClient = useQueryClient();
  const {
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { isValid, isDirty, isSubmitting },
    control,
  } = formContext;
  const addAbsenceMutation = useAddAbsence();

  // Watch startDate and multiDay to auto-set endDate
  const startDate = useWatch({ control, name: "startDate" });
  useEffect(() => {
    if (!multiDay) {
      setValue("endDate", startDate);
    }
  }, [startDate, multiDay, setValue]);

  const handleOnCancelClick = () => {
    modal.remove();
    reset();
    setMultiDay(false);
  };

  const onSubmit = async (data: FormValues) => {
    await addAbsenceMutation.mutateAsync(
      {
        childId: childId,
        data: {
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
        },
      },
      {
        onSuccess: onMutateSuccess,
        onError: onMutateError,
      },
    );
  };

  const onMutateSuccess = () => {
    enqueueSnackbar(t("Absence added"), { variant: "success" });
    modal.remove();
    reset();
    setMultiDay(false);
    queryClient.invalidateQueries();
  };

  const onMutateError = (error: any) => {
    if (error?.errors) {
      error.errors.forEach((propertyError: any) => {
        setError(propertyError.property as any, {
          type: "server",
          message: propertyError.title,
        });
      });
    }
  };

  return (
    <Dialog {...muiDialogV5(modal)} maxWidth="xs" fullWidth>
      <DialogTitle>{t("Add Absence")}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2, color: "text.secondary", fontSize: "0.875rem" }}>
          {t("To add an absence, please enter the details below.")}
        </DialogContentText>
        <FormContainer formContext={formContext} handleSubmit={void handleSubmit(onSubmit)}>
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
          <FormControlLabel
            control={
              <Switch
                checked={multiDay}
                onChange={(_, checked) => setMultiDay(checked)}
                color="primary"
                inputProps={{ "aria-label": "multi-day absence" }}
              />
            }
            label={t("Multi-day absence")}
            sx={{ mt: 1, mb: 1 }}
          />
          {multiDay && (
            <DatePickerElement
              label={t("Start Date")}
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
          )}
          <TextFieldElement name="reason" label={t("Reason")} fullWidth margin="normal" />
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
          onClick={() => {
            handleSubmit(onSubmit)();
          }}
        >
          <span>{t("Add", { ns: "common" })}</span>
        </Button>
      </DialogActions>
    </Dialog>
  );
});
