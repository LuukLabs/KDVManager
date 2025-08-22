import React from "react";
import { Box, Button, useTheme, useMediaQuery } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import NiceModal from "@ebay/nice-modal-react";
import { useTranslation } from "react-i18next";
import { ChildScheduleTimeline } from "./ChildScheduleTimeline";
import { AddChildScheduleDialogV2 } from "./AddChildScheduleDialog_v2";
import { AddEndMarkForm } from "../endmarks/AddEndMarkForm";
import FlagIcon from "@mui/icons-material/Flag";

type ChildScheduleViewProps = {
  childId: string;
};

export const ChildScheduleView: React.FC<ChildScheduleViewProps> = ({ childId }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showAddEndMark, setShowAddEndMark] = React.useState(false);

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
        <Button
          variant={showAddEndMark ? "outlined" : "text"}
          onClick={() => setShowAddEndMark((s) => !s)}
          startIcon={<FlagIcon />}
          size={isMobile ? "large" : "medium"}
          fullWidth={isMobile}
          sx={{
            minHeight: { xs: 48, md: "auto" },
            fontSize: { xs: "1rem", md: "0.875rem" },
            fontWeight: 600,
            px: { xs: 3, md: 2 },
            borderRadius: 2,
          }}
        >
          {showAddEndMark ? t("Cancel") : t("Add End Mark")}
        </Button>
      </Box>
      {showAddEndMark && (
        <Box sx={{ mt: 2 }}>
          <AddEndMarkForm childId={childId} onAdded={() => setShowAddEndMark(false)} />
        </Box>
      )}
      <Box sx={{ mt: 3 }}>
        {/* Unified Timeline */}
        <ChildScheduleTimeline childId={childId} />
      </Box>
    </Box>
  );
};
