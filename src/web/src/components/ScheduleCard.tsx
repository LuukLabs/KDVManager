import React from "react";
import { Box, Card, CardContent, Typography, Chip, IconButton, Stack } from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import dayjs from "dayjs";
import { WeeklyScheduleGrid } from "./WeeklyScheduleGrid";
import { type ChildScheduleListVMScheduleRule } from "@api/models/childScheduleListVMScheduleRule";
import { useTranslation } from "react-i18next";

type ScheduleCardProps = {
  schedule: {
    id: string;
    startDate: string;
    endDate: string;
    scheduleRules: ChildScheduleListVMScheduleRule[];
  };
  onDelete: (scheduleId: string) => void;
  onEdit?: (scheduleId: string) => void;
};

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ schedule, onDelete, onEdit }) => {
  const { t } = useTranslation();
  const now = dayjs();
  const startDate = dayjs(schedule.startDate);
  const endDate = dayjs(schedule.endDate);

  const isActive = now.isAfter(startDate) && now.isBefore(endDate.add(1, "day"));
  const isUpcoming = now.isBefore(startDate);
  const isExpired = now.isAfter(endDate);

  const getStatusChip = () => {
    if (isActive) {
      return <Chip label={t("Active")} color="success" size="small" />;
    } else if (isUpcoming) {
      return <Chip label={t("Upcoming")} color="info" size="small" />;
    } else if (isExpired) {
      return <Chip label={t("Expired")} color="default" size="small" />;
    }
    return null;
  };

  const getDateRangeDisplay = () => {
    const startDate = dayjs(schedule.startDate);
    const endDate = dayjs(schedule.endDate);

    if (startDate.isSame(endDate, "year")) {
      if (startDate.isSame(endDate, "month")) {
        return `${startDate.format("MMM D")} - ${endDate.format("D, YYYY")}`;
      }
      return `${startDate.format("MMM D")} - ${endDate.format("MMM D, YYYY")}`;
    }
    return `${startDate.format("MMM D, YYYY")} - ${endDate.format("MMM D, YYYY")}`;
  };

  return (
    <Card
      sx={{
        border: isActive ? 2 : 1,
        borderColor: isActive ? "success.main" : "divider",
      }}
    >
      <CardContent>
        {/* Header */}
        <Box
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {t("Schedule Period")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getDateRangeDisplay()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {getStatusChip()}
            <Box>
              {onEdit && (
                <IconButton size="small" onClick={() => onEdit(schedule.id)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton size="small" onClick={() => onDelete(schedule.id)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Weekly Schedule Grid */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t("Weekly Schedule")}
          </Typography>
          <WeeklyScheduleGrid scheduleRules={schedule.scheduleRules} />
        </Box>

        {/* Schedule Summary */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t("Schedule Summary")}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.5 }}>
            {schedule.scheduleRules.length > 0 ? (
              <>
                <Chip
                  label={`${schedule.scheduleRules.length} ${t("time slots")}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`${new Set(schedule.scheduleRules.map((r) => r.day)).size} ${t("days")}`}
                  size="small"
                  variant="outlined"
                />
                {schedule.scheduleRules.some((r) => r.groupName) && (
                  <Chip
                    label={`${new Set(schedule.scheduleRules.filter((r) => r.groupName).map((r) => r.groupName)).size} ${t("groups")}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t("No schedule rules defined")}
              </Typography>
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};
