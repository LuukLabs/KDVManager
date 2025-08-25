import { useForm, type SubmitHandler, useFieldArray } from "react-hook-form";
import { FormContainer } from "react-hook-form-mui";
import { DatePickerElement } from "react-hook-form-mui/date-pickers";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import NiceModal, { muiDialogV5, useModal } from "@ebay/nice-modal-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { type UnprocessableEntityResponse } from "@api/models/unprocessableEntityResponse";
import { type AddScheduleCommand } from "@api/models/addScheduleCommand";
import { type DayOfWeek } from "@api/models/dayOfWeek";
import {
  Box,
  Typography,
  IconButton,
  Stack,
  useMediaQuery,
  Chip,
  Card,
  Avatar,
  ButtonBase,
  Collapse,
  alpha,
  useTheme,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { getGetChildSchedulesQueryKey, useAddSchedule, useDeleteSchedule } from "@api/endpoints/schedules/schedules";
import { useState, useCallback } from "react";
import dayjs from "dayjs";

type EditChildScheduleDialogProps = {
  childId: string;
  schedule: {
    id: string;
    startDate: string;
    endDate: string | null;
    scheduleRules: {
      day: DayOfWeek;
      timeSlotId: string;
      groupId: string;
      timeSlotName?: string;
      groupName?: string;
    }[];
  };
};

import { useListGroups } from "@api/endpoints/groups/groups";
import { useListTimeSlots } from "@api/endpoints/time-slots/time-slots";

export const EditChildScheduleDialog = NiceModal.create<EditChildScheduleDialogProps>(
  ({ childId, schedule }) => {
    const { t } = useTranslation();
    const modal = useModal();
    const mutate = useAddSchedule();
    const deleteMutate = useDeleteSchedule();
    const queryClient = useQueryClient();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [editingRule, setEditingRule] = useState<number | null>(null);

    // Fetch groups and timeslots from API
    const { data: groupsData } = useListGroups(undefined, {});
    const { data: timeSlotsData } = useListTimeSlots(undefined, {});

    // Map API data to UI format
    const groups = (groupsData?.value ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      color: "#4ECDC4", // fallback color, could be improved if API provides
      icon: "👥", // fallback icon, could be improved if API provides
    }));
    const timeSlots = (timeSlotsData?.value ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      time: `${t.startTime} - ${t.endTime}`,
      color: "#FFE5B4", // fallback color, could be improved if API provides
    }));

    const formContext = useForm<AddScheduleCommand>({
      defaultValues: {
        scheduleRules: schedule.scheduleRules.map((rule) => ({
          day: rule.day,
          timeSlotId: rule.timeSlotId,
          groupId: rule.groupId,
        })),
        startDate: schedule.startDate,
      },
      mode: "onChange",
    });

    const {
      control,
      handleSubmit,
      reset,
      setError,
      formState: { isValid, isSubmitting },
      watch,
      setValue,
    } = formContext;
    const { enqueueSnackbar } = useSnackbar();

    const { fields, append, remove } = useFieldArray({ control, name: "scheduleRules" });
    const watchedRules = watch("scheduleRules");

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

      const submitData = {
        ...data,
        scheduleRules: filteredScheduleRules,
      };

      // First delete the old schedule, then create the new one
      try {
        await deleteMutate.mutateAsync({ id: schedule.id });
        await mutate.mutateAsync(
          { data: { childId: childId, ...submitData } },
          { onSuccess: onMutateSuccess, onError: onMutateError },
        );
      } catch (error) {
        console.error("Error updating schedule:", error);
        enqueueSnackbar(t("Failed to update schedule"), { variant: "error" });
      }
    };

    const onMutateSuccess = useCallback(() => {
      void queryClient.invalidateQueries({
        queryKey: getGetChildSchedulesQueryKey({ childId: childId }),
      });
      modal.remove();
      enqueueSnackbar(t("Schedule updated successfully"), { variant: "success" });
      reset();
    }, [queryClient, childId, modal, enqueueSnackbar, t, reset]);

    const onMutateError = useCallback(
      (error: UnprocessableEntityResponse) => {
        error.errors.forEach((propertyError) => {
          setError(propertyError.property as any, {
            type: "server",
            message: propertyError.title,
          });
        });
      },
      [setError],
    );

    // Define the weekdays as in AddChildScheduleDialogV2
    const weekdays = [
      { key: "monday", value: 1, label: t("Monday"), short: t("Mon"), emoji: "📅" },
      { key: "tuesday", value: 2, label: t("Tuesday"), short: t("Tue"), emoji: "📅" },
      { key: "wednesday", value: 3, label: t("Wednesday"), short: t("Wed"), emoji: "📅" },
      { key: "thursday", value: 4, label: t("Thursday"), short: t("Thu"), emoji: "📅" },
      { key: "friday", value: 5, label: t("Friday"), short: t("Fri"), emoji: "📅" },
      { key: "saturday", value: 6, label: t("Saturday"), short: t("Sat"), emoji: "📅" },
      { key: "sunday", value: 0, label: t("Sunday"), short: t("Sun"), emoji: "📅" },
    ];

    const addNewRule = useCallback(() => {
      const newIndex = fields.length;
      append({ day: undefined as any, timeSlotId: "", groupId: "" });
      setEditingRule(newIndex);
    }, [fields.length, append, setEditingRule]);

    const getTotalRules = useCallback(() => fields.length, [fields.length]);

    const getCompletedRules = useCallback(() => {
      return fields.filter((_, index) => {
        const rule = watchedRules?.[index];
        return rule?.timeSlotId && rule.groupId && rule.day !== undefined;
      }).length;
    }, [fields, watchedRules]);

    const isRuleComplete = useCallback(
      (index: number) => {
        const rule = watchedRules?.[index];
        return rule?.timeSlotId && rule.groupId && rule.day !== undefined;
      },
      [watchedRules],
    );

    // Day selector component
    const DaySelector = ({ ruleIndex }: { ruleIndex: number }) => {
      const currentRule = watchedRules?.[ruleIndex];
      return (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary", mb: 2 }}>
            {t("Select Day")}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)",
              gap: 1,
            }}
          >
            {weekdays.map((day) => {
              const isSelected = currentRule?.day === day.value;
              return (
                <ButtonBase
                  key={day.key}
                  onClick={() => setValue(`scheduleRules.${ruleIndex}.day`, day.value as DayOfWeek)}
                  sx={{
                    p: isMobile ? 2 : 1.5,
                    borderRadius: 2,
                    border: "2px solid",
                    borderColor: isSelected ? "primary.main" : "grey.300",
                    backgroundColor: isSelected ? "primary.50" : "transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "primary.50",
                      transform: "translateY(-2px)",
                    },
                    "&:active": {
                      transform: "translateY(0px)",
                    },
                  }}
                >
                  <Stack alignItems="center" spacing={0.5}>
                    <Box sx={{ fontSize: isMobile ? "1.5rem" : "1.2rem" }}>{day.emoji}</Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: isSelected ? "primary.main" : "text.primary",
                        fontSize: isMobile ? "0.8rem" : "0.7rem",
                      }}
                    >
                      {isMobile ? day.label : day.short}
                    </Typography>
                  </Stack>
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
      );
    };

    // Time slot selector component
    const TimeSlotSelector = ({ ruleIndex }: { ruleIndex: number }) => {
      const currentRule = watchedRules?.[ruleIndex];
      return (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary", mb: 2 }}>
            {t("Select Time Slot")}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: isMobile ? 1 : 2,
            }}
          >
            {timeSlots.map((slot) => {
              const isSelected = currentRule?.timeSlotId === slot.id;
              return (
                <ButtonBase
                  key={slot.id}
                  onClick={() => setValue(`scheduleRules.${ruleIndex}.timeSlotId`, slot.id)}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "2px solid",
                    borderColor: isSelected ? "primary.main" : "grey.300",
                    backgroundColor: isSelected ? "primary.50" : alpha(slot.color, 0.3),
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-2px)",
                      boxShadow: 2,
                    },
                    "&:active": {
                      transform: "translateY(0px)",
                    },
                  }}
                >
                  <Stack spacing={0.5} alignItems="flex-start">
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {slot.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {slot.time}
                    </Typography>
                    {isSelected && <CheckCircleIcon sx={{ color: "primary.main", fontSize: 24 }} />}
                  </Stack>
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
      );
    };

    // Group selector component
    const GroupSelector = ({ ruleIndex }: { ruleIndex: number }) => {
      const currentRule = watchedRules?.[ruleIndex];
      return (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary", mb: 2 }}>
            {t("Select Group")}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: isMobile ? 1 : 2,
            }}
          >
            {groups.map((group) => {
              const isSelected = currentRule?.groupId === group.id;
              return (
                <ButtonBase
                  key={group.id}
                  onClick={() => setValue(`scheduleRules.${ruleIndex}.groupId`, group.id)}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "2px solid",
                    borderColor: isSelected ? "primary.main" : "grey.300",
                    backgroundColor: isSelected ? "primary.50" : alpha(group.color, 0.3),
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-2px)",
                      boxShadow: 2,
                    },
                    "&:active": {
                      transform: "translateY(0px)",
                    },
                  }}
                >
                  <Stack spacing={1} alignItems="center">
                    <Box sx={{ fontSize: "2rem" }}>{group.icon}</Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, textAlign: "center" }}>
                      {group.name}
                    </Typography>
                    {isSelected && <CheckCircleIcon sx={{ color: "primary.main", fontSize: 24 }} />}
                  </Stack>
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
      );
    };

    // Rule card component
    const RuleCard = ({ index }: { index: number }) => {
      const isComplete = isRuleComplete(index);
      const isEditing = editingRule === index;
      const rule = watchedRules?.[index];
      const theme = useTheme();
      const dayInfo = weekdays.find((d) => d.value === rule?.day);
      const groupInfo = groups.find((g) => g.id === rule?.groupId);
      const timeSlotInfo = timeSlots.find((t) => t.id === rule?.timeSlotId);

      return (
        <Card
          elevation={0}
          sx={{
            border: "2px solid",
            borderColor: isEditing ? "primary.main" : isComplete ? "success.200" : "warning.200",
            borderRadius: 3,
            mb: 2,
            overflow: "hidden",
            backgroundColor: isEditing ? "primary.25" : isComplete ? "success.25" : "warning.25",
            transition: "all 0.2s ease",
          }}
        >
          {/* Rule Header */}
          <Box
            sx={{
              p: 2,
              backgroundColor: isEditing ? "primary.50" : isComplete ? "success.50" : "warning.50",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid",
              borderBottomColor: isEditing
                ? "primary.200"
                : isComplete
                  ? "success.200"
                  : "warning.200",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: isComplete ? "success.main" : "warning.main",
                  color: "#fff",
                }}
              >
                {isComplete ? (
                  <CheckCircleIcon sx={{ fontSize: 20 }} />
                ) : (
                  <UncheckedIcon sx={{ fontSize: 20 }} />
                )}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t("Rule")} {index + 1}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isComplete ? t("Complete") : t("Incomplete")}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!isEditing && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setEditingRule(index)}
                  sx={{ borderRadius: 2 }}
                >
                  {t("Edit")}
                </Button>
              )}
              <IconButton
                color="error"
                size="small"
                onClick={() => {
                  remove(index);
                  if (editingRule === index) setEditingRule(null);
                }}
                sx={{
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  "&:hover": { backgroundColor: alpha(theme.palette.error.main, 0.2) },
                }}
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Rule Content */}
          <Box sx={{ p: 2 }}>
            <Collapse in={isEditing} timeout={300}>
              {isEditing && (
                <Stack spacing={3}>
                  <DaySelector ruleIndex={index} />
                  <TimeSlotSelector ruleIndex={index} />
                  <GroupSelector ruleIndex={index} />

                  <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => setEditingRule(null)}
                      fullWidth
                      sx={{ borderRadius: 2 }}
                      disabled={!(rule?.day && rule?.timeSlotId && rule?.groupId)}
                    >
                      {t("Done")}
                    </Button>
                  </Box>
                </Stack>
              )}
            </Collapse>

            <Collapse in={!isEditing} timeout={300}>
              {!isEditing && (
                <Stack spacing={2}>
                  {/* Summary view */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    {dayInfo && (
                      <Chip
                        label={`${dayInfo.emoji} ${isMobile ? dayInfo.short : dayInfo.label}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      />
                    )}
                    {timeSlotInfo && (
                      <Chip
                        label={`⏰ ${timeSlotInfo.name}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      />
                    )}
                    {groupInfo && (
                      <Chip
                        label={`${groupInfo.icon} ${groupInfo.name}`}
                        size="small"
                        sx={{
                          backgroundColor: alpha(groupInfo.color, 0.1),
                          borderColor: groupInfo.color,
                          color: groupInfo.color,
                          borderRadius: 2,
                        }}
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {!isComplete && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        backgroundColor: "warning.50",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "warning.200",
                      }}
                    >
                      <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 500 }}>
                        {!rule?.day && t("Please select a day")}
                        {!rule?.timeSlotId && rule?.day && t("Please select a time slot")}
                        {!rule?.groupId &&
                          rule?.day &&
                          rule?.timeSlotId &&
                          t("Please select a group")}
                      </Typography>
                    </Paper>
                  )}
                </Stack>
              )}
            </Collapse>
          </Box>
        </Card>
      );
    };

    // Get sorted rules for display
    const getSortedRules = useCallback(() => {
      return fields
        .map((field, index) => ({ field, index }))
        .sort((a, b) => {
          const ruleA = watchedRules?.[a.index];
          const ruleB = watchedRules?.[b.index];
          
          // Sort by day first, then by completion status
          if (ruleA?.day !== undefined && ruleB?.day !== undefined) {
            if (ruleA.day !== ruleB.day) {
              return ruleA.day - ruleB.day;
            }
          }
          
          // If days are same or undefined, sort by completion
          const completeA = isRuleComplete(a.index);
          const completeB = isRuleComplete(b.index);
          
          if (completeA !== completeB) {
            return completeA ? -1 : 1; // Complete rules first
          }
          
          return a.index - b.index; // Original order as tiebreaker
        });
    }, [fields, watchedRules, isRuleComplete]);

    const sortedRules = getSortedRules();

    return (
      <Dialog
        {...muiDialogV5(modal)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 4,
            maxHeight: isMobile ? "100vh" : "95vh",
            background: "#fff",
            overflow: "hidden",
          },
        }}
      >
        {/* Enhanced Header */}
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: "#fff",
            pb: 3,
            pt: isMobile ? 4 : 3,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(ellipse at top right, ${alpha("#fff", 0.1)} 0%, transparent 70%)`,
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  backgroundColor: alpha("#fff", 0.2),
                  color: "#fff",
                  width: isMobile ? 48 : 40,
                  height: isMobile ? 48 : 40,
                }}
              >
                <ScheduleIcon sx={{ fontSize: isMobile ? 28 : 24 }} />
              </Avatar>
              <Box>
                <Typography
                  variant={isMobile ? "h5" : "h6"}
                  sx={{ fontWeight: 700, fontSize: isMobile ? "1.5rem" : "1.25rem" }}
                >
                  {t("Edit Schedule")}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  {t("Modify your weekly schedule")}
                </Typography>
              </Box>
            </Box>

            {getTotalRules() > 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  <Chip
                    label={`${getCompletedRules()}/${getTotalRules()} ${t("Complete")}`}
                    size="small"
                    sx={{
                      backgroundColor: "#fff",
                      color: "primary.main",
                      fontWeight: 600,
                      "& .MuiChip-label": { px: 2 },
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    height: 8,
                    backgroundColor: alpha("#fff", 0.2),
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      backgroundColor: "#fff",
                      borderRadius: 4,
                      width: `${getTotalRules() > 0 ? (getCompletedRules() / getTotalRules()) * 100 : 0}%`,
                      transition: "width 0.5s ease",
                      boxShadow: "0 0 10px rgba(255,255,255,0.3)",
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, backgroundColor: "#f8f9fa", position: "relative" }}>
          <FormContainer formContext={formContext} handleSubmit={handleSubmit(onSubmit)}>
            {/* Date Range Section */}
            <Box
              sx={{
                p: 3,
                backgroundColor: "#fff",
                borderBottom: "1px solid",
                borderBottomColor: "grey.200",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <Avatar
                  sx={{
                    backgroundColor: "primary.50",
                    color: "primary.main",
                    width: 40,
                    height: 40,
                  }}
                >
                  <TodayIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem", mb: 0.5 }}>
                    {t("Schedule Period")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("Select the start date for this schedule")}
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={isMobile ? 2 : 3} direction={isMobile ? "column" : "row"}>
                <DatePickerElement
                  label={t("Start Date")}
                  name="startDate"
                  slotProps={{
                    textField: {
                      size: "medium",
                      fullWidth: true,
                      variant: "outlined",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&:hover": { boxShadow: 1 },
                        },
                      },
                    },
                  }}
                  transform={{
                    input: (value) => (value ? dayjs(value) : null),
                    output: (value) => (value ? value.format("YYYY-MM-DD") : null),
                  }}
                />
              </Stack>
            </Box>

            {/* Rules Section */}
            <Box sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    sx={{
                      backgroundColor: "secondary.50",
                      color: "secondary.main",
                      width: 40,
                      height: 40,
                    }}
                  >
                    <TimeIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                      {t("Schedule Rules")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("Add time slots for each day of the week")}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addNewRule}
                  sx={{
                    borderRadius: 3,
                    px: isMobile ? 2 : 3,
                    py: 1.5,
                    fontWeight: 600,
                    boxShadow: 2,
                    "&:hover": { boxShadow: 3, transform: "translateY(-1px)" },
                    transition: "all 0.2s ease",
                  }}
                >
                  {isMobile ? t("Add") : t("Add Rule")}
                </Button>
              </Box>

              {/* Rules List */}
              {sortedRules.length > 0 ? (
                <Stack spacing={2}>
                  {sortedRules.map(({ index }) => (
                    <RuleCard key={`rule-${index}`} index={index} />
                  ))}
                </Stack>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 6,
                    px: 3,
                  }}
                >
                  <ScheduleIcon sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t("No rules added yet")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {t("Add your first schedule rule to get started")}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={addNewRule}
                    sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 600 }}
                  >
                    {t("Add First Rule")}
                  </Button>
                </Box>
              )}
            </Box>
          </FormContainer>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            gap: 2,
            backgroundColor: "#fff",
            borderTop: "1px solid",
            borderTopColor: "grey.200",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleOnCancelClick}
            size="large"
            fullWidth={isMobile}
            sx={{
              borderRadius: 3,
              py: 1.5,
              fontWeight: 600,
              borderWidth: 2,
              "&:hover": { borderWidth: 2 },
            }}
          >
            {t("Cancel", { ns: "common" })}
          </Button>
          <Button
            variant="contained"
            disabled={!isValid || getCompletedRules() === 0}
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            size="large"
            fullWidth={isMobile}
            sx={{
              borderRadius: 3,
              py: 1.5,
              fontWeight: 700,
              boxShadow: 3,
              "&:hover": {
                boxShadow: 4,
                transform: "translateY(-1px)",
              },
              "&:disabled": {
                boxShadow: 1,
              },
              transition: "all 0.2s ease",
            }}
          >
            {isSubmitting ? t("Updating...") : t("Update Schedule")}
            {getTotalRules() > 0 && !isSubmitting && ` (${getCompletedRules()}/${getTotalRules()})`}
          </Button>
        </DialogActions>
      </Dialog>
    );
  },
);
