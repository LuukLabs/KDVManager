import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import dayjs from "dayjs";
import { WeeklyScheduleGrid } from "./WeeklyScheduleGrid";
import { type ChildScheduleListVMScheduleRule } from "@api/models/childScheduleListVMScheduleRule";
import { useTranslation } from "react-i18next";
import { DeleteScheduleButton } from "../features/schedules/DeleteScheduleButton";

type ScheduleCardProps = {
  schedule: {
    id: string;
    startDate: string;
    endDate: string | null;
    scheduleRules: ChildScheduleListVMScheduleRule[];
  };
};

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ schedule }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const now = dayjs();
  const startDate = dayjs(schedule.startDate);
  const endDate = schedule.endDate ? dayjs(schedule.endDate) : null;

  // If endDate is null the schedule is open-ended (ongoing after startDate)
  const isUpcoming = now.isBefore(startDate);
  // Include start date as active (isSame or after start)
  const isActive = endDate
    ? (now.isAfter(startDate) || now.isSame(startDate, "day")) &&
      (now.isBefore(endDate.add(1, "day")) || now.isSame(endDate, "day"))
    : now.isAfter(startDate) || now.isSame(startDate, "day");
  const isExpired = endDate ? now.isAfter(endDate) && !now.isSame(endDate, "day") : false;

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
    const start = dayjs(schedule.startDate);
    const end = schedule.endDate ? dayjs(schedule.endDate) : null;

    console.warn("end", end);

    if (!end) {
      return `${start.format("MMM D, YYYY")} • ${t("No end date")}`;
    }

    if (start.isSame(end, "year")) {
      if (start.isSame(end, "month")) {
        return `${start.format("MMM D")} - ${end.format("D, YYYY")}`;
      }
      return `${start.format("MMM D")} - ${end.format("MMM D, YYYY")}`;
    }
    return `${start.format("MMM D, YYYY")} - ${end.format("MMM D, YYYY")}`;
  };

  return (
    <Card
      sx={{
        border: isActive ? 2 : 1,
        borderColor: isActive ? "success.main" : "divider",
      }}
    >
      <CardContent sx={{ p: isMobile ? 2 : 3, "&:last-child": { pb: isMobile ? 2 : 3 } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 1 : 0,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
              {t("Schedule Period")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getDateRangeDisplay()}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              alignSelf: isMobile ? "stretch" : "auto",
              justifyContent: isMobile ? "space-between" : "flex-end",
            }}
          >
            {getStatusChip()}
            <Box>
              <DeleteScheduleButton id={schedule.id} />
            </Box>
          </Box>
        </Box>

        {/* Weekly Schedule Grid */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t("Weekly Schedule")}
          </Typography>
          <WeeklyScheduleGrid scheduleRules={schedule.scheduleRules} isMobile={isMobile} />
        </Box>

        {/* Schedule Summary */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t("Schedule Summary")}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: "wrap",
              gap: 0.5,
              "& > *": {
                flexShrink: 0,
              },
            }}
          >
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
