import React from "react";
import { Box, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import NiceModal from "@ebay/nice-modal-react";
import { useTranslation } from "react-i18next";
import { ChildScheduleCards } from "../../components/ChildScheduleCards";
import { AddChildScheduleDialogV2 } from "./AddChildScheduleDialog_v2";

type ChildScheduleViewProps = {
  childId: string;
};

export const ChildScheduleView: React.FC<ChildScheduleViewProps> = ({ childId }) => {
  const { t } = useTranslation();

  const onAddChildScheduleClickHandler = () =>
    void NiceModal.show(AddChildScheduleDialogV2, { childId: childId });

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
      <Box sx={{ mt: 3 }}>
        <ChildScheduleCards childId={childId} />
      </Box>
    </Box>
  );
};
