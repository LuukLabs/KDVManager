import { Controller, useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { FormContainer } from "react-hook-form-mui";
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
import { type AddScheduleCommand } from "@api/models/addScheduleCommand";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { MenuItem, Select, InputLabel, FormControl, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
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
    const { fields, append, remove } = useFieldArray({
      control,
      name: "scheduleRules",
    });

    const handleOnCancelClick = () => {
      modal.remove();
      reset();
    };

    const onSubmit: SubmitHandler<AddScheduleCommand> = async (data) => {
      await mutate.mutateAsync(
        { data: { childId: childId, ...data } },
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

    const renderScheduleFields = (item, index) => (
      <Grid container key={item.id}>
        <Grid size={3}>
          <FormControl fullWidth>
            <InputLabel>{t("Day")}</InputLabel>
            <Controller
              name={`scheduleRules.${index}.day`}
              control={control}
              defaultValue={item.day}
              render={({ field }) => (
                <Select {...field}>
                  {[
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday",
                  ].map((day, index) => (
                    <MenuItem key={day} value={index}>
                      {t(day.charAt(0).toUpperCase() + day.slice(1))}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </Grid>
        <Grid size={3}>
          <FormControl fullWidth>
            <Controller
              name={`scheduleRules.${index}.timeSlotId`}
              control={control}
              render={({ field, fieldState }) => (
                <TimeSlotAutocomplete
                  {...field}
                  onChange={(event, newValue) => field.onChange(newValue ? newValue.id : null)}
                  value={field.value}
                  error={!!fieldState.error}
                  helperText={fieldState.error ? fieldState.error.message : null}
                />
              )}
            />
          </FormControl>
        </Grid>
        <Grid size={1}>
          <IconButton onClick={() => remove(index)}>
            <DeleteIcon />
          </IconButton>
        </Grid>
      </Grid>
    );

    return (
      <Dialog {...muiDialogV5(modal)}>
        <DialogTitle>{t("Add schedule")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("To add a schedule, please enter the details below.")}
          </DialogContentText>
          <FormContainer formContext={formContext} handleSubmit={handleSubmit(onSubmit)}>
            <Grid container alignItems="flex-start" spacing={2}>
              <Grid size={12}>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <DatePicker
                      label={t("Start date")}
                      defaultValue={field.value ? dayjs(field.value) : undefined}
                      inputRef={field.ref}
                      format="L"
                      onChange={(date) => {
                        field.onChange(date);
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <DatePicker
                      label={t("End date")}
                      defaultValue={field.value ? dayjs(field.value) : undefined}
                      inputRef={field.ref}
                      format="L"
                      onChange={(date) => {
                        field.onChange(date);
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <FormControl required fullWidth>
                  <Controller
                    name={`groupId`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <GroupAutocomplete
                        {...field}
                        onChange={(event, newValue) =>
                          field.onChange(newValue ? newValue.id : null)
                        }
                        value={field.value}
                        error={!!fieldState.error}
                        helperText={fieldState.error ? fieldState.error.message : null}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid size={12}>
                {fields.map((item, index) => renderScheduleFields(item, index))}
              </Grid>
              <Grid size={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => append({ day: 0 })}
                >
                  {t("Add Day Schedule")}
                </Button>
              </Grid>
            </Grid>
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
  },
);
