import { Controller, useForm, type SubmitHandler, useFieldArray } from "react-hook-form";
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
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Tooltip,
  Stack,
  useTheme,
  useMediaQuery,
  Chip,
} from "@mui/material";
import { AccessTime as AccessTimeIcon } from "@mui/icons-material";
import GroupAutocomplete from "../groups/GroupAutocomplete";
import TimeSlotAutocomplete from "../timeSlots/TimeSlotAutocomplete";
import { getGetChildSchedulesQueryKey, useAddSchedule } from "@api/endpoints/schedules/schedules";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";

type AddChildScheduleDialogProps = {
  childId: string;
};

export const AddChildScheduleDialog = NiceModal.create<AddChildScheduleDialogProps>(
  ({ childId }) => {
    const { t } = useTranslation();
    const modal = useModal();
    const mutate = useAddSchedule();
    const queryClient = useQueryClient();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const formContext = useForm<AddScheduleCommand>({
      defaultValues: {
        scheduleRules: [],
      },
      mode: "onChange",
    });

    const {
      control,
      handleSubmit,
      reset,
      setError,
      formState: { isValid, isDirty, isSubmitting },
    } = formContext;
    const { enqueueSnackbar } = useSnackbar();

    const { fields, append, remove } = useFieldArray({ control, name: "scheduleRules" });

    const handleOnCancelClick = () => {
      modal.remove();
      reset();
    };

    const onSubmit: SubmitHandler<AddScheduleCommand> = async (data) => {
      // Filter out schedule rules that don't have a timeslot or group selected
      const filteredScheduleRules =
        data.scheduleRules?.filter(
          (rule) => rule?.timeSlotId && rule.groupId && rule.day !== undefined,
        ) ?? [];

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

    const getDayRules = (dayValue: number) => {
      return fields
        .map((field, index) => ({ field, index }))
        .filter(({ field }) => (field as any).day === dayValue);
    };

    const addRuleForDay = (dayValue: number) => {
      append({ day: dayValue as any, timeSlotId: "", groupId: "" });
    };

    const renderDaySection = (day: { key: string; value: number; label: string }) => {
      const dayRules = getDayRules(day.value);
      const ruleCount = dayRules.length;

      return (
        <Paper
          key={day.key}
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: ruleCount > 0 ? "primary.200" : "grey.200",
            borderRadius: 2,
            overflow: "hidden",
            backgroundColor: ruleCount > 0 ? "primary.25" : "grey.25",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              borderColor: "primary.main",
              boxShadow: 1,
            },
          }}
        >
          {/* Day Header */}
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: ruleCount > 0 ? "primary.50" : "transparent",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: ruleCount > 0 ? "primary.main" : "text.primary",
                }}
              >
                {day.label}
              </Typography>
              {ruleCount > 0 && (
                <Chip
                  label={ruleCount}
                  color="primary"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    height: 20,
                    minWidth: 20,
                    "& .MuiChip-label": {
                      px: 0.75,
                      fontSize: "0.7rem",
                    },
                  }}
                />
              )}
            </Box>
            <Tooltip title={t("Add time slot") as string} arrow>
              <IconButton
                size="small"
                color="primary"
                onClick={() => addRuleForDay(day.value)}
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Rules Content */}
          {ruleCount > 0 && (
            <Box sx={{ px: 2.5, pb: 2 }}>
              <Stack spacing={1.5}>
                {dayRules.map(({ field, index }, ruleIndex) => (
                  <Box
                    key={field.id}
                    sx={{
                      p: 2,
                      backgroundColor: "white",
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: "grey.200",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 16, color: "primary.main" }} />
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: "text.secondary" }}
                      >
                        {t("Time Slot {number}", { number: ruleIndex + 1 })}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Tooltip title={t("Remove") as string} arrow>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => remove(index)}
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: "error.50",
                            "&:hover": {
                              backgroundColor: "error.100",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s ease-in-out",
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Stack spacing={1.5} direction={isMobile ? "column" : "row"}>
                      <Controller
                        name={`scheduleRules.${index}.timeSlotId`}
                        control={control}
                        render={({ field }) => (
                          <TimeSlotAutocomplete
                            size="small"
                            fullWidth
                            onChange={(_, newValue) =>
                              field.onChange(newValue ? newValue.id : null)
                            }
                          />
                        )}
                      />
                      <Controller
                        name={`scheduleRules.${index}.groupId`}
                        control={control}
                        render={({ field }) => (
                          <GroupAutocomplete
                            size="small"
                            fullWidth
                            onChange={(_, newValue) =>
                              field.onChange(newValue ? newValue.id : null)
                            }
                          />
                        )}
                      />
                    </Stack>

                    {/* Hidden field for day value */}
                    <Controller
                      name={`scheduleRules.${index}.day`}
                      control={control}
                      defaultValue={day.value as any}
                      render={() => <></>}
                    />
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Paper>
      );
    };

    return (
      <Dialog
        {...muiDialogV5(modal)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            maxHeight: isMobile ? "100vh" : "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            borderBottom: "1px solid",
            borderBottomColor: "divider",
            backgroundColor: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CalendarTodayIcon sx={{ color: "primary.main", fontSize: 24 }} />
            <Typography
              variant="h5"
              component="div"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              {t("Add schedule")}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <DialogContentText
            sx={{ mb: 4, color: "text.secondary", fontSize: "0.95rem", lineHeight: 1.6 }}
          >
            {t(
              "Create a weekly schedule by defining the date range and adding time slots for each weekday. You can add multiple time slots per day for different groups.",
            )}
          </DialogContentText>

          <FormContainer formContext={formContext} handleSubmit={handleSubmit(onSubmit)}>
            {/* Date Range Section */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                backgroundColor: "grey.50",
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <CalendarTodayIcon sx={{ color: "primary.main", fontSize: 20 }} />
                <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
                  {t("Schedule Period")}
                </Typography>
              </Box>

              <Stack spacing={2} direction={isMobile ? "column" : "row"}>
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
                    output: (value) => (value ? value.format("YYYY-MM-DD") : null),
                  }}
                />
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
                    output: (value) => (value ? value.format("YYYY-MM-DD") : null),
                  }}
                />
              </Stack>
            </Paper>

            {/* Weekly Schedule Section */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <GroupIcon sx={{ color: "primary.main", fontSize: 20 }} />
                <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
                  {t("Weekly Schedule")}
                </Typography>
              </Box>

              <Stack spacing={2}>{weekdays.map((day) => renderDaySection(day))}</Stack>
            </Box>
          </FormContainer>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 3,
            gap: 2,
            borderTop: "1px solid",
            borderTopColor: "divider",
            backgroundColor: "white",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleOnCancelClick}
            size="large"
            fullWidth={isMobile}
            sx={{
              borderColor: "grey.300",
              color: "text.secondary",
              "&:hover": {
                borderColor: "grey.400",
                backgroundColor: "grey.50",
              },
            }}
          >
            {t("Cancel", { ns: "common" })}
          </Button>
          <Button
            variant="contained"
            disabled={!isDirty || !isValid}
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            size="large"
            fullWidth={isMobile}
            sx={{
              minWidth: isMobile ? "auto" : 160,
              boxShadow: 2,
              "&:hover": {
                boxShadow: 3,
              },
            }}
          >
            <span>{t("Add Schedule")}</span>
          </Button>
        </DialogActions>
      </Dialog>
    );
  },
);
