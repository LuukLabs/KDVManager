import React from "react";
import { Box, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import NiceModal from "@ebay/nice-modal-react";
import { AddChildScheduleDialog } from "./AddChildScheduleDialog";
import { useTranslation } from "react-i18next";
import { ChildScheduleCards } from "../../components/ChildScheduleCards";

type ChildScheduleViewProps = {
  childId: string;
};

export const ChildScheduleView: React.FC<ChildScheduleViewProps> = ({ childId }) => {
  const { t } = useTranslation();

  const onAddChildScheduleClickHandler = () =>
    void NiceModal.show(AddChildScheduleDialog, { childId: childId });

  return (
    <Box>
      {/* Common Toolbar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          onClick={onAddChildScheduleClickHandler}
          startIcon={<AddIcon />}
          size="medium"
        >
          {t("Add Schedule")}
        </Button>
      </Box>
      <ChildScheduleCards childId={childId} />
    </Box>
  );
};
