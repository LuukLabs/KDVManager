import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import { type ChildScheduleListVMScheduleRule } from "@api/models/childScheduleListVMScheduleRule";
import { useTranslation } from "react-i18next";

type ScheduleRulesDisplayProps = {
  scheduleRules: ChildScheduleListVMScheduleRule[];
};

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

export const ScheduleRulesDisplay: React.FC<ScheduleRulesDisplayProps> = ({ scheduleRules }) => {
  const { t } = useTranslation();

  if (!scheduleRules || scheduleRules.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("No schedule rules")}
      </Typography>
    );
  }

  // Sort rules by day for consistent display
  const sortedRules = [...scheduleRules].sort((a, b) => (a.day ?? 0) - (b.day ?? 0));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, py: 0.5 }}>
      {sortedRules.map((rule, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            minHeight: 20,
          }}
        >
          {/* Day of week */}
          <Typography
            variant="body2"
            sx={{
              minWidth: 28,
              fontWeight: "medium",
              color: "text.primary",
              fontSize: "0.8rem",
            }}
          >
            {DAY_NAMES[rule.day ?? 0]}
          </Typography>

          {/* Time slot */}
          <Chip
            label={`${rule.startTime?.slice(0, 5)} - ${rule.endTime?.slice(0, 5)}`}
            size="small"
            variant="outlined"
            sx={{
              fontSize: "0.7rem",
              height: 18,
              color: "text.primary",
              borderColor: "divider",
              "& .MuiChip-label": {
                px: 0.5,
              },
            }}
          />

          {/* Time slot name */}
          {rule.timeSlotName && (
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.7rem",
                color: "text.secondary",
                maxWidth: 100,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {rule.timeSlotName}
            </Typography>
          )}

          {/* Group */}
          {rule.groupName && (
            <Chip
              label={rule.groupName}
              size="small"
              sx={{
                fontSize: "0.7rem",
                height: 18,
                backgroundColor: getGroupColor(rule.groupName),
                color: "white",
                maxWidth: 120,
                "& .MuiChip-label": {
                  px: 0.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
};
