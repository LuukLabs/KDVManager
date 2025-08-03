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
        data.scheduleRules?.filter((rule) => rule?.timeSlotId && rule.groupId) ?? [];

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
        queryKey: getGetChildSchedulesQueryKey({ childId: childId }),
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
      { key: "monday", value: 1, label: t("Monday") },
      { key: "tuesday", value: 2, label: t("Tuesday") },
      { key: "wednesday", value: 3, label: t("Wednesday") },
      { key: "thursday", value: 4, label: t("Thursday") },
      { key: "friday", value: 5, label: t("Friday") },
    ];

    const renderWeeklySchedule = () => (
      <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2 }}>
        {weekdays.map((day, index) => (
          <Box
            key={day.key}
            sx={{
              mb: index === weekdays.length - 1 ? 0 : 1.5,
              display: "flex",
              alignItems: "center",
              gap: 2,
              py: 1,
            }}
          >
            <Typography
              variant="body2"
              fontWeight="medium"
              sx={{
                minWidth: 80,
                color: "text.secondary",
                fontSize: "0.875rem",
              }}
            >
              {day.label}
            </Typography>
            <Grid container spacing={1.5} sx={{ flex: 1 }}>
              <Grid size={6}>
                <Controller
                  name={`scheduleRules.${day.value}.timeSlotId`}
                  control={control}
                  render={({ field }) => (
                    <TimeSlotAutocomplete
                      size="small"
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
                      size="small"
                      onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
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
      <Dialog {...muiDialogV5(modal)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="div">
            {t("Add schedule")}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <DialogContentText sx={{ mb: 2, color: "text.secondary", fontSize: "0.875rem" }}>
            {t("To add a schedule, please enter the details below.")}
          </DialogContentText>
          <FormContainer formContext={formContext} handleSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Left Column - Date Range */}
              <Grid size={4}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ fontSize: "1.1rem" }}>
                    {t("Schedule Period")}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={12}>
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
                    </Grid>
                    <Grid size={12}>
                      <DatePickerElement
                        label={t("End date")}
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
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Right Column - Weekly Schedule */}
              <Grid size={8}>
                <Box>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ fontSize: "1.1rem" }}>
                    {t("Weekly Schedule")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, fontSize: "0.875rem" }}
                  >
                    {t("Select the days and time slots for this schedule")}
                  </Typography>

                  {renderWeeklySchedule()}
                </Box>
              </Grid>
            </Grid>
          </FormContainer>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" onClick={handleOnCancelClick} size="medium">
            {t("Cancel", { ns: "common" })}
          </Button>
          <Button
            variant="contained"
            disabled={!isDirty || !isValid}
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            size="medium"
          >
            <span>{t("Add Schedule")}</span>
          </Button>
        </DialogActions>
      </Dialog>
    );
  },
);
