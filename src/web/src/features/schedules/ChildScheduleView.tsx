import React, { useState } from "react";
import { 
  Box, 
  Toolbar, 
  Button, 
  ToggleButton, 
  ToggleButtonGroup, 
  Tooltip
} from "@mui/material";
import { 
  Add as AddIcon, 
  ViewList as ViewListIcon, 
  ViewModule as ViewModuleIcon 
} from "@mui/icons-material";
import NiceModal from "@ebay/nice-modal-react";
import { AddChildScheduleDialog } from "./AddChildScheduleDialog";
import { useTranslation } from "react-i18next";
import { ChildSchedule as ChildScheduleDataGrid } from "./ChildSchedule";
import { ChildScheduleCards } from "../../components/ChildScheduleCards";

type ChildScheduleViewProps = {
  childId: string;
};

export const ChildScheduleView: React.FC<ChildScheduleViewProps> = ({ childId }) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  const onAddChildScheduleClickHandler = () =>
    void NiceModal.show(AddChildScheduleDialog, { childId: childId });

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewMode: 'table' | 'cards' | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  return (
    <Box>
      {/* Common Toolbar */}
      <Toolbar sx={{ gap: 2, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            onClick={onAddChildScheduleClickHandler}
            startIcon={<AddIcon />}
          >
            {t("Add Schedule")}
          </Button>
        </Box>
        
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="cards">
            <Tooltip title={t("Card View")}>
              <ViewModuleIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="table">
            <Tooltip title={t("Table View")}>
              <ViewListIcon />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Toolbar>

      {/* Content based on view mode */}
      {viewMode === 'cards' ? (
        <ChildScheduleCards childId={childId} />
      ) : (
        <ChildScheduleDataGrid childId={childId} />
      )}
    </Box>
  );
};
