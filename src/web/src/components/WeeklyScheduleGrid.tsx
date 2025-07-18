import React from "react";
import { Box, Chip, Typography, Paper } from "@mui/material";
import { type ChildScheduleListVMScheduleRule } from "@api/models/childScheduleListVMScheduleRule";
import { useTranslation } from "react-i18next";

type WeeklyScheduleGridProps = {
  scheduleRules: ChildScheduleListVMScheduleRule[];
  isMobile?: boolean;
  weekStartsOnMonday?: boolean; // New prop to control week start
};

// Enum for days of the week
enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

const DAY_INDEX_MAP_SUN = [
  DayOfWeek.Sunday,
  DayOfWeek.Monday,
  DayOfWeek.Tuesday,
  DayOfWeek.Wednesday,
  DayOfWeek.Thursday,
  DayOfWeek.Friday,
  DayOfWeek.Saturday,
]; // Sunday to Saturday
const DAY_INDEX_MAP_MON = [
  DayOfWeek.Monday,
  DayOfWeek.Tuesday,
  DayOfWeek.Wednesday,
  DayOfWeek.Thursday,
  DayOfWeek.Friday,
  DayOfWeek.Saturday,
  DayOfWeek.Sunday,
]; // Monday to Sunday

// Color palette for different groups
const GROUP_COLORS = [
  "#1976d2", // Blue
  "#388e3c", // Green
  "#f57c00", // Orange
  "#7b1fa2", // Purple
  "#c2185b", // Pink
  "#00796b", // Teal
  "#5d4037", // Brown
  "#455a64", // Blue Grey
];

const getGroupColor = (groupName: string | null | undefined): string => {
  if (!groupName) return "#757575"; // Grey for no group

  // Simple hash function to get consistent colors for group names
  let hash = 0;
  for (let i = 0; i < groupName.length; i++) {
    hash = ((hash << 5) - hash + groupName.charCodeAt(i)) & 0xffffffff;
  }
  return GROUP_COLORS[Math.abs(hash) % GROUP_COLORS.length];
};

export const WeeklyScheduleGrid: React.FC<WeeklyScheduleGridProps> = ({
  scheduleRules,
  isMobile = false,
  weekStartsOnMonday = true,
}) => {
  const { t } = useTranslation();

  // Translated day names
  const translatedDayNames = [
    t("dayNames.sun"),
    t("dayNames.mon"),
    t("dayNames.tue"),
    t("dayNames.wed"),
    t("dayNames.thu"),
    t("dayNames.fri"),
    t("dayNames.sat"),
  ];
  // Long day names for mobile
  const translatedDayLongNames = [
    t("dayNamesLong.sunday"),
    t("dayNamesLong.monday"),
    t("dayNamesLong.tuesday"),
    t("dayNamesLong.wednesday"),
    t("dayNamesLong.thursday"),
    t("dayNamesLong.friday"),
    t("dayNamesLong.saturday"),
  ];

  if (!scheduleRules || scheduleRules.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("No schedule rules")}
      </Typography>
    );
  }

  // Group rules by day (using DayOfWeek enum)
  const rulesByDay = scheduleRules.reduce(
    (acc, rule) => {
      const day = (rule.day ?? DayOfWeek.Sunday) as DayOfWeek;
      if (!acc[day]) acc[day] = [];
      acc[day].push(rule);
      return acc;
    },
    {} as Record<DayOfWeek, ChildScheduleListVMScheduleRule[]>,
  );

  // Sort rules within each day by start time
  Object.keys(rulesByDay).forEach((day) => {
    const dayKey = Number(day) as DayOfWeek;
    rulesByDay[dayKey].sort(
      (a: ChildScheduleListVMScheduleRule, b: ChildScheduleListVMScheduleRule) => {
        const timeA = a.startTime || "00:00";
        const timeB = b.startTime || "00:00";
        return timeA.localeCompare(timeB);
      },
    );
  });

  const DAY_INDEX_MAP = weekStartsOnMonday ? DAY_INDEX_MAP_MON : DAY_INDEX_MAP_SUN;

  return (
    <Box sx={{ width: "100%" }}>
      {isMobile ? (
        // Mobile: Stack days vertically
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {DAY_INDEX_MAP.map((dayIdx) => {
            const dayRules = rulesByDay[dayIdx as DayOfWeek];
            if (!dayRules || dayRules.length === 0) return null;
            return (
              <Paper
                key={dayIdx}
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: "action.hover",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: "medium",
                    mb: 1,
                    color: "text.primary",
                  }}
                >
                  {translatedDayLongNames[dayIdx]}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {dayRules.map((rule: ChildScheduleListVMScheduleRule, index: number) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: getGroupColor(rule.groupName),
                        color: "white",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "medium", minWidth: "fit-content" }}
                      >
                        {rule.startTime?.slice(0, 5)} - {rule.endTime?.slice(0, 5)}
                      </Typography>
                      {rule.groupName && (
                        <Typography
                          variant="body2"
                          sx={{
                            opacity: 0.9,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {rule.groupName}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Paper>
            );
          })}
        </Box>
      ) : (
        // Desktop: Grid layout
        <Box sx={{ display: "flex", gap: 1 }}>
          {DAY_INDEX_MAP.map((dayIdx) => {
            const dayRules = rulesByDay[dayIdx as DayOfWeek];
            return (
              <Box key={dayIdx} sx={{ flex: 1, minWidth: 0 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1,
                    minHeight: 80,
                    backgroundColor: dayRules ? "action.hover" : "transparent",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "medium",
                      display: "block",
                      textAlign: "center",
                      mb: 0.5,
                    }}
                  >
                    {translatedDayNames[dayIdx]}
                  </Typography>

                  {dayRules && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      {dayRules.map((rule: ChildScheduleListVMScheduleRule, index: number) => (
                        <Box key={index}>
                          <Chip
                            label={`${rule.startTime?.slice(0, 5)}-${rule.endTime?.slice(0, 5)}`}
                            size="small"
                            sx={{
                              fontSize: "0.6rem",
                              height: 16,
                              width: "100%",
                              backgroundColor: getGroupColor(rule.groupName),
                              color: "white",
                              "& .MuiChip-label": {
                                px: 0.5,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              },
                            }}
                          />
                          {rule.groupName && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: "0.55rem",
                                color: "text.secondary",
                                display: "block",
                                textAlign: "center",
                                mt: 0.25,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {rule.groupName}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
