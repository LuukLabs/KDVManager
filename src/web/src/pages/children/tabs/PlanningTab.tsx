import { Box, Grid, Typography, Button, Stack, Paper, useTheme, useMediaQuery } from "@mui/material";
import {
  Schedule as ScheduleIcon,
  CalendarMonth as CalendarIcon,
  Add as AddIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import NiceModal from "@ebay/nice-modal-react";
import { ChildScheduleTimeline } from "../../../features/schedules/ChildScheduleTimeline";
import { AddChildScheduleDialogV2 } from "../../../features/schedules/AddChildScheduleDialog_v2";
import { AddEndMarkDialog } from "../../../features/endmarks/AddEndMarkDialog";
import { AbsenceList } from "../../../features/absence/AbsenceList";
import { AddAbsenceDialog } from "../../../features/absence/AddAbsenceDialog";

type PlanningTabProps = {
  childId: string;
};

type SectionHeaderProps = {
  icon: React.ReactNode;
  title: string;
  actions: React.ReactNode;
};

// Shared header shape for both panels below: icon + title on the left,
// primary action(s) on the right. Keeping this in one place is what makes
// "Add Schedule / Add End Mark" and "Add Absence" read as the same pattern.
const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, actions }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: { xs: "flex-start", sm: "center" },
      justifyContent: "space-between",
      mb: { xs: 2, md: 3 },
      flexDirection: { xs: "column", sm: "row" },
      gap: { xs: 2, sm: 2 },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {icon}
      <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </Box>
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      sx={{ width: { xs: "100%", sm: "auto" } }}
    >
      {actions}
    </Stack>
  </Box>
);

export const PlanningTab: React.FC<PlanningTabProps> = ({ childId }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const onAddScheduleClickHandler = () =>
    void NiceModal.show(AddChildScheduleDialogV2, { childId });
  const onAddEndMarkClickHandler = () => void NiceModal.show(AddEndMarkDialog, { childId });
  const onAddAbsenceClickHandler = () => void NiceModal.show(AddAbsenceDialog, { childId });

  const actionButtonSx = {
    borderRadius: 2,
    minHeight: { xs: 48, md: "auto" },
    fontSize: { xs: "1rem", md: "0.875rem" },
    fontWeight: 600,
    px: { xs: 3, md: 2 },
  };

  return (
    <Grid container spacing={{ xs: 2, md: 4 }} sx={{ alignItems: "flex-start" }}>
      {/* Current Schedule */}
      <Grid size={{ xs: 12, lg: 7 }}>
        <Paper
          variant="outlined"
          sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, backgroundColor: "background.paper" }}
        >
          <SectionHeader
            icon={<ScheduleIcon color="primary" />}
            title={t("Current Schedule")}
            actions={
              <>
                <Button
                  variant="contained"
                  onClick={onAddScheduleClickHandler}
                  startIcon={<AddIcon />}
                  size={isMobile ? "large" : "medium"}
                  fullWidth={isMobile}
                  sx={actionButtonSx}
                >
                  {t("Add Schedule")}
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={onAddEndMarkClickHandler}
                  startIcon={<FlagIcon />}
                  size={isMobile ? "large" : "medium"}
                  fullWidth={isMobile}
                  sx={actionButtonSx}
                >
                  {t("Add End Mark")}
                </Button>
              </>
            }
          />
          <ChildScheduleTimeline childId={childId} />
        </Paper>
      </Grid>

      {/* Absence Management */}
      <Grid size={{ xs: 12, lg: 5 }}>
        <Paper
          variant="outlined"
          sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, backgroundColor: "background.paper" }}
        >
          <SectionHeader
            icon={<CalendarIcon color="primary" />}
            title={t("Absence Management")}
            actions={
              <Button
                variant="contained"
                onClick={onAddAbsenceClickHandler}
                startIcon={<AddIcon />}
                size={isMobile ? "large" : "medium"}
                fullWidth={isMobile}
                sx={actionButtonSx}
              >
                {t("Add Absence")}
              </Button>
            }
          />
          <AbsenceList childId={childId} />
        </Paper>
      </Grid>
    </Grid>
  );
};
