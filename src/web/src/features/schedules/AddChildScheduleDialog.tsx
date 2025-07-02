import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { FormContainer } from "react-hook-form-mui";
import { DatePickerElement } from "react-hook-form-mui/date-pickers";
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
import { type UnprocessableEntityResponse } from "@api/models/unprocessableEntityResponse";
import { type AddScheduleCommand } from "@api/models/addScheduleCommand";
import Grid from "@mui/material/Grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { Box, Typography } from "@mui/material";
import GroupAutocomplete from "../groups/GroupAutocomplete";
import TimeSlotAutocomplete from "../timeSlots/TimeSlotAutocomplete";
import { getGetChildSchedulesQueryKey, useAddSchedule } from "@api/endpoints/schedules/schedules";

type AddChildScheduleDialogProps = {
  childId: string;
};

export const AddChildScheduleDialog = NiceModal.create<AddChildScheduleDialogProps>(
  ({ childId }) => {
  const { t } = useTranslation();
  const modal = useModal();
  const mutate = useAddSchedule();
  const queryClient = useQueryClient();
  const formContext = useForm<AddScheduleCommand>({ defaultValues: { scheduleRules: [] } });

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

  const onSubmit: SubmitHandler<AddScheduleCommand> = async (data) => {
    // Filter out schedule rules that don't have a timeslot or group selected
    const filteredScheduleRules =
      data.scheduleRules?.filter((rule) => rule && rule.timeSlotId && rule.groupId) || [];

    const submitData = {
      ...data,
      scheduleRules: filteredScheduleRules,
    };

    await mutate.mutateAsync(
      { data: { childId: childId, ...submitData } },
      { onSuccess: onMutateSuccess, onError: onMutateError },
    );
  };

    const onMutateSuccess = () => {
      void queryClient.invalidateQueries({
        queryKey: getGetChildSchedulesQueryKey({ ChildId: childId }),
      });
      modal.remove();
      enqueueSnackbar(t("Schedule added"), { variant: "success" });
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

    const weekdays = [
      { key: "monday", value: 0, label: t("Monday") },
      { key: "tuesday", value: 1, label: t("Tuesday") },
      { key: "wednesday", value: 2, label: t("Wednesday") },
      { key: "thursday", value: 3, label: t("Thursday") },
      { key: "friday", value: 4, label: t("Friday") },
    ];

    const renderWeeklySchedule = () => (
      <Box>
        {weekdays.map((day) => (
          <Box key={day.key} sx={{ mb: 2, py: 0.5, border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
              {day.label}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Controller
                  name={`scheduleRules.${day.value}.timeSlotId`}
                  control={control}
                  render={({ field }) => (
                    <TimeSlotAutocomplete
                      value={null}
                      onChange={(_, newValue) => {
                        field.onChange(newValue ? newValue.id : null);
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid size={6}>
                <Controller
                  name={`scheduleRules.${day.value}.groupId`}
                  control={control}
                  render={({ field }) => (
                    <GroupAutocomplete
                      value={null}
                      onChange={(_, newValue) =>
                        field.onChange(newValue ? newValue.id : null)
                      }
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Controller
              name={`scheduleRules.${day.value}.day`}
              control={control}
              defaultValue={day.value as any}
              render={() => <></>} // Hidden field
            />
          </Box>
        ))}
      </Box>
    );

    return (
      <Dialog {...muiDialogV5(modal)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="div">
            {t("Add schedule")}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <DialogContentText sx={{ mb: 3, color: "text.secondary" }}>
            {t("To add a schedule, please enter the details below.")}
          </DialogContentText>
          <FormContainer formContext={formContext} handleSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              {/* Left Column */}
              <Grid size={6}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Date Range Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom color="primary">
                      {t("Schedule Period")}
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={12}>
                        <DatePickerElement label={t("Start Date")} name="startDate" />
                      </Grid>
                      <Grid size={12}>
                        <Controller
                          control={control}
                          name="endDate"
                          render={({ field, fieldState }) => (
                            <DatePicker
                              label={t("End date")}
                              defaultValue={field.value ? dayjs(field.value) : undefined}
                              inputRef={field.ref}
                              format="L"
                              onChange={(date) => {
                                field.onChange(date);
                              }}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  error: !!fieldState.error,
                                  helperText: fieldState.error ? fieldState.error.message : null,
                                },
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Grid>

              {/* Right Column - Weekly Schedule */}
              <Grid size={6}>
                <Box>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {t("Weekly Schedule")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t("Select the days and time slots for this schedule")}
                  </Typography>

                  {renderWeeklySchedule()}
                </Box>
              </Grid>
            </Grid>
          </FormContainer>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" onClick={handleOnCancelClick} size="large">
            {t("Cancel", { ns: "common" })}
          </Button>
          <Button
            variant="contained"
            disabled={!isDirty || !isValid}
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            size="large"
          >
            <span>{t("Add Schedule", { ns: "common" })}</span>
          </Button>
        </DialogActions>
      </Dialog>
    );
  },
);
