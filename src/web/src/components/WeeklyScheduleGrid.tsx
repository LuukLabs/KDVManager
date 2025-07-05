import React from "react";
import { Box, Chip, Typography, Paper } from "@mui/material";
import { type ChildScheduleListVMScheduleRule } from "@api/models/childScheduleListVMScheduleRule";
import { useTranslation } from "react-i18next";

type WeeklyScheduleGridProps = {
  scheduleRules: ChildScheduleListVMScheduleRule[];
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
}) => {
  const { t } = useTranslation();
  
  if (!scheduleRules || scheduleRules.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("No schedule rules")}
      </Typography>
    );
  }

  // Group rules by day
  const rulesByDay = scheduleRules.reduce((acc, rule) => {
    const day = rule.day ?? 0;
    if (!acc[day]) acc[day] = [];
    acc[day].push(rule);
    return acc;
  }, {} as Record<number, ChildScheduleListVMScheduleRule[]>);

  // Sort rules within each day by start time
  Object.keys(rulesByDay).forEach(day => {
    rulesByDay[parseInt(day)].sort((a, b) => {
      const timeA = a.startTime || "00:00";
      const timeB = b.startTime || "00:00";
      return timeA.localeCompare(timeB);
    });
  });

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", gap: 1 }}>
        {DAY_NAMES.map((dayName, dayIndex) => (
          <Box key={dayIndex} sx={{ flex: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                minHeight: 100,
                backgroundColor: rulesByDay[dayIndex] ? "action.hover" : "background.default",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: rulesByDay[dayIndex] ? "action.selected" : "action.hover",
                  borderColor: 'primary.main',
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  color: "text.primary",
                  display: "block",
                  textAlign: "center",
                  mb: 0.5,
                  fontSize: "0.7rem",
                }}
              >
                {dayName}
              </Typography>
              
              {rulesByDay[dayIndex] && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {rulesByDay[dayIndex].map((rule, index) => (
                    <Box key={index}>
                      <Chip
                        label={`${rule.startTime?.slice(0, 5)}-${rule.endTime?.slice(0, 5)}`}
                        size="small"
                        sx={{
                          fontSize: "0.65rem",
                          height: 18,
                          width: "100%",
                          backgroundColor: getGroupColor(rule.groupName),
                          color: "white",
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: 2,
                          },
                          "& .MuiChip-label": {
                            px: 0.5,
                          },
                        }}
                      />
                      {rule.groupName && (
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.6rem",
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
        ))}
      </Box>
    </Box>
  );
};
