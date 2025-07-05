import React, { useState } from "react";
import { 
  Box, 
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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Button
          variant="contained"
          onClick={onAddChildScheduleClickHandler}
          startIcon={<AddIcon />}
          size="medium"
        >
          {t("Add Schedule")}
        </Button>
        
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
      </Box>

      {/* Content based on view mode */}
      {viewMode === 'cards' ? (
        <ChildScheduleCards childId={childId} />
      ) : (
        <ChildScheduleDataGrid childId={childId} />
      )}
    </Box>
  );
};
