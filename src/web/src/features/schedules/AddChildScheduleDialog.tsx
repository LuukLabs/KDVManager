import { useCallback } from "react";
import { useForm, type SubmitHandler, useFieldArray } from "react-hook-form";
import {
  Form,
  FormDatePicker,
  FormSelect,
  applyServerValidationErrors,
  saveFailedMessage,
} from "@components/forms";
import { Divider, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import NiceModal, { muiDialogV5, useModal } from "@ebay/nice-modal-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { type AddScheduleCommand } from "@api/scheduling/models/addScheduleCommand";
import {
  getGetChildSchedulesQueryKey,
  useAddSchedule,
} from "@api/scheduling/endpoints/schedules/schedules";
import { useListGroups } from "@api/scheduling/endpoints/groups/groups";
import { useListTimeSlots } from "@api/scheduling/endpoints/time-slots/time-slots";

type AddChildScheduleDialogProps = {
  childId: string;
};

export const AddChildScheduleDialog = NiceModal.create<AddChildScheduleDialogProps>(
  ({ childId }) => {
    const { t } = useTranslation();
    const modal = useModal();
    const mutate = useAddSchedule();
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    const { data: groupsData } = useListGroups(undefined, {});
    const { data: timeSlotsData } = useListTimeSlots(undefined, {});

    const dayOptions = [
      { id: 1, label: t("Monday") },
      { id: 2, label: t("Tuesday") },
      { id: 3, label: t("Wednesday") },
      { id: 4, label: t("Thursday") },
      { id: 5, label: t("Friday") },
    ];
    const timeSlotOptions = (timeSlotsData ?? [])
      .filter((slot) => !!slot.id)
      .map((slot) => ({
        id: slot.id!,
        label: `${slot.name} (${slot.startTime} - ${slot.endTime})`,
      }));
    const groupOptions = (groupsData ?? [])
      .filter((group) => !!group.id)
      .map((group) => ({
        id: group.id!,
        label: group.name ?? "",
      }));

    const formContext = useForm<AddScheduleCommand>({
      defaultValues: { scheduleRules: [] },
      mode: "onChange",
    });

    const {
      control,
      handleSubmit,
      reset,
      setError,
      formState: { isValid, isDirty, isSubmitting },
    } = formContext;

    const { fields, append, remove } = useFieldArray({ control, name: "scheduleRules" });

    const addRule = useCallback(() => {
      append({ day: undefined, timeSlotId: "", groupId: "" });
    }, [append]);

    const handleOnCancelClick = useCallback(() => {
      modal.remove();
      reset();
    }, [modal, reset]);

    const onSubmit: SubmitHandler<AddScheduleCommand> = async (data) => {
      const filteredScheduleRules =
        data.scheduleRules?.filter(
          (rule) => rule?.timeSlotId && rule.groupId && rule.day !== undefined,
        ) ?? [];

      if (filteredScheduleRules.length === 0) {
        enqueueSnackbar(t("Please add at least one schedule rule"), { variant: "warning" });
        return;
      }

      await mutate.mutateAsync(
        { data: { childId, ...data, scheduleRules: filteredScheduleRules } },
        { onSuccess: onMutateSuccess, onError: onMutateError },
      );
    };

    const onMutateSuccess = useCallback(() => {
      void queryClient.invalidateQueries({
        queryKey: getGetChildSchedulesQueryKey({ childId }),
      });
      modal.remove();
      enqueueSnackbar(t("Schedule added successfully"), { variant: "success" });
      reset();
    }, [queryClient, childId, modal, enqueueSnackbar, t, reset]);

    const onMutateError = useCallback(
      (error: unknown) => {
        if (applyServerValidationErrors(error, setError)) {
          enqueueSnackbar(t("Please check the form for errors"), { variant: "error" });
        } else {
          enqueueSnackbar(saveFailedMessage(t), { variant: "error" });
        }
      },
      [setError, enqueueSnackbar, t],
    );

    return (
      <Dialog {...muiDialogV5(modal)} maxWidth="sm" fullWidth>
        <DialogTitle>{t("Add Schedule")}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t("Set the start date and add one or more weekly schedule rules.")}
          </DialogContentText>
          <Form formContext={formContext} onSubmit={onSubmit}>
            <FormDatePicker
              label={t("Start Date")}
              name="startDate"
              slotProps={{ textField: { size: "small", fullWidth: true } }}
              transform={{
                output: (value) => (value ? value.format("YYYY-MM-DD") : null),
              }}
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              {t("Schedule Rules")}
            </Typography>

            <Stack spacing={2}>
              {fields.length === 0 && (
                <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                    {t("No schedule rules yet")}
                  </Typography>
                  <Button startIcon={<AddIcon />} size="small" onClick={addRule}>
                    {t("Add Rule")}
                  </Button>
                </Paper>
              )}
              {fields.map((field, index) => (
                <Paper key={field.id} variant="outlined" sx={{ p: 2, position: "relative" }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormSelect
                        name={`scheduleRules.${index}.day`}
                        label={t("Day")}
                        options={dayOptions}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormSelect
                        name={`scheduleRules.${index}.timeSlotId`}
                        label={t("Time slot")}
                        options={timeSlotOptions}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormSelect
                        name={`scheduleRules.${index}.groupId`}
                        label={t("Group")}
                        options={groupOptions}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                  </Grid>
                  <IconButton
                    color="error"
                    onClick={() => remove(index)}
                    size="small"
                    aria-label={t("Remove")}
                    sx={{ position: "absolute", top: 4, right: 4 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
              {fields.length > 0 && (
                <Button
                  startIcon={<AddIcon />}
                  variant="outlined"
                  size="small"
                  onClick={addRule}
                  sx={{ alignSelf: "flex-start" }}
                >
                  {t("Add Rule")}
                </Button>
              )}
            </Stack>
          </Form>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleOnCancelClick}>
            {t("Cancel", { ns: "common" })}
          </Button>
          <Button
            variant="contained"
            disabled={!isDirty || !isValid || fields.length === 0}
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            <span>{t("Create Schedule")}</span>
          </Button>
        </DialogActions>
      </Dialog>
    );
  },
);
