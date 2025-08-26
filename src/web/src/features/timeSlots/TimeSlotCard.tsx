import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  Collapse,
  alpha,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { Controller, useForm } from "react-hook-form";
import { TimeField } from "@mui/x-date-pickers/TimeField";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

import { type TimeSlotListVM } from "@api/models/timeSlotListVM";
import { type UpdateTimeSlotCommand } from "@api/models/updateTimeSlotCommand";
import { getListTimeSlotsQueryKey, useUpdateTimeSlot } from "@api/endpoints/time-slots/time-slots";
import DeleteTimeSlotButton from "./DeleteTimeSlotButton";

type TimeSlotCardProps = {
  timeSlot: TimeSlotListVM;
};

export const TimeSlotCard: React.FC<TimeSlotCardProps> = ({ timeSlot }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isEditing, setIsEditing] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const updateMutation = useUpdateTimeSlot();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty },
  } = useForm<UpdateTimeSlotCommand>({
    defaultValues: {
      id: timeSlot.id,
      name: timeSlot.name,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
    },
    mode: "onChange",
  });

  const handleEditClick = () => {
    setIsEditing(true);
    reset({
      id: timeSlot.id,
      name: timeSlot.name,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
    });
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    reset();
  };

  const onSubmit = async (data: UpdateTimeSlotCommand) => {
    try {
      await updateMutation.mutateAsync({
        id: timeSlot.id!,
        data: data,
      });

      void queryClient.invalidateQueries({ queryKey: getListTimeSlotsQueryKey() });
      enqueueSnackbar(t("Time slot updated"), { variant: "success" });
      setIsEditing(false);
    } catch (error: any) {
      if (error?.errors) {
        error.errors.forEach((propertyError: any) => {
          setError(propertyError.property as any, {
            type: "server",
            message: propertyError.title,
          });
        });
      } else {
        enqueueSnackbar(t("Failed to update time slot"), { variant: "error" });
      }
    }
  };

  const formatTime = (time: string) => {
    return dayjs(time, "HH:mm:ss").format("HH:mm");
  };

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        border: isEditing ? "2px solid" : "1px solid",
        borderColor: isEditing ? "primary.main" : "grey.200",
        transition: "all 0.3s ease",
        "&:hover": {
          elevation: 4,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          {!isEditing ? (
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  mb: 1,
                }}
              >
                {timeSlot.name}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  icon={<TimeIcon />}
                  label={`${formatTime(timeSlot.startTime!)} - ${formatTime(timeSlot.endTime!)}`}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderColor: "primary.main",
                    color: "primary.main",
                  }}
                />
              </Stack>
            </Box>
          ) : (
            <Box sx={{ flex: 1, mr: 2 }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2}>
                  <Controller
                    name="name"
                    control={control}
                    rules={{
                      required: t("Name is required"),
                      minLength: {
                        value: 2,
                        message: t("Name must be at least 2 characters"),
                      },
                      maxLength: {
                        value: 25,
                        message: t("Name must not exceed 25 characters"),
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label={t("Name")}
                        size="small"
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        autoFocus
                      />
                    )}
                  />
                  <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                    <Controller
                      name="startTime"
                      control={control}
                      rules={{
                        required: t("Start time is required"),
                      }}
                      render={({ field, fieldState }) => (
                        <TimeField
                          label={t("Start time")}
                          value={field.value ? dayjs(field.value, "HH:mm:ss") : null}
                          onChange={(date) => {
                            field.onChange(date?.format("HH:mm:ss"));
                          }}
                          format="HH:mm"
                          size="small"
                          sx={{ flex: 1 }}
                          slotProps={{
                            textField: {
                              error: !!fieldState.error,
                              helperText: fieldState.error?.message,
                            },
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="endTime"
                      control={control}
                      rules={{
                        required: t("End time is required"),
                        validate: (value, formValues) => {
                          if (!value || !formValues.startTime) return true;
                          const startTime = dayjs(formValues.startTime, "HH:mm:ss");
                          const endTime = dayjs(value, "HH:mm:ss");
                          return (
                            endTime.isAfter(startTime) || t("End time must be after start time")
                          );
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <TimeField
                          label={t("End time")}
                          value={field.value ? dayjs(field.value, "HH:mm:ss") : null}
                          onChange={(date) => {
                            field.onChange(date?.format("HH:mm:ss"));
                          }}
                          format="HH:mm"
                          size="small"
                          sx={{ flex: 1 }}
                          slotProps={{
                            textField: {
                              error: !!fieldState.error,
                              helperText: fieldState.error?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </Stack>
                </Stack>
              </form>
            </Box>
          )}

          {/* Action buttons */}
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            {!isEditing ? (
              <>
                <Tooltip title={t("Edit") as string} arrow>
                  <IconButton
                    size="small"
                    onClick={handleEditClick}
                    sx={{
                      color: "primary.main",
                      "&:hover": {
                        backgroundColor: "primary.50",
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <DeleteTimeSlotButton id={timeSlot.id!} displayName={timeSlot.name!} />
              </>
            ) : (
              <>
                <Tooltip title={t("Save") as string} arrow>
                  <IconButton
                    size="small"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting || !isDirty}
                    sx={{
                      color: "success.main",
                      "&:hover": {
                        backgroundColor: "success.50",
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <SaveIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("Cancel") as string} arrow>
                  <IconButton
                    size="small"
                    onClick={handleCancelClick}
                    disabled={isSubmitting}
                    sx={{
                      color: "error.main",
                      "&:hover": {
                        backgroundColor: "error.50",
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <CancelIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        {/* Mobile-friendly action buttons for editing mode */}
        <Collapse in={isEditing && isMobile}>
          <Box sx={{ pt: 2, borderTop: "1px solid", borderColor: "grey.200" }}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                size="small"
                startIcon={<CancelIcon />}
                onClick={handleCancelClick}
                disabled={isSubmitting}
              >
                {t("Cancel")}
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<SaveIcon />}
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || !isDirty}
              >
                {t("Save")}
              </Button>
            </Stack>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};
