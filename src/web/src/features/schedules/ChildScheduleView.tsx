import React from "react";
import { Box, Button, useTheme, useMediaQuery } from "@mui/material";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
          size={isMobile ? "large" : "medium"}
          fullWidth={isMobile}
          sx={{
            minHeight: { xs: 48, md: "auto" }, // Larger touch target on mobile
            fontSize: { xs: "1rem", md: "0.875rem" }, // Larger text on mobile
            fontWeight: 600,
            px: { xs: 3, md: 2 },
            borderRadius: 2,
          }}
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
