import React, { useState } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { ViewList, ViewModule } from "@mui/icons-material";
import { type ChildScheduleListVMScheduleRule } from "@api/models/childScheduleListVMScheduleRule";
import { ScheduleRulesDisplay } from "./ScheduleRulesDisplay";
import { WeeklyScheduleGrid } from "./WeeklyScheduleGrid";
import { useTranslation } from "react-i18next";

type ScheduleVisualizationProps = {
  scheduleRules: ChildScheduleListVMScheduleRule[];
}

export const ScheduleVisualization: React.FC<ScheduleVisualizationProps> = ({
  scheduleRules,
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const toggleViewMode = () => {
    setViewMode(prev => prev === "list" ? "grid" : "list");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title={viewMode === "list" ? t("Switch to grid view") : t("Switch to list view")}>
          <IconButton 
            size="small" 
            onClick={toggleViewMode}
            sx={{ alignSelf: "flex-start" }}
          >
            {viewMode === "list" ? <ViewModule /> : <ViewList />}
          </IconButton>
        </Tooltip>
      </Box>
      
      {viewMode === "list" ? (
        <ScheduleRulesDisplay scheduleRules={scheduleRules} />
      ) : (
        <WeeklyScheduleGrid scheduleRules={scheduleRules} />
      )}
    </Box>
  );
};
