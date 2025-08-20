import {
  Box,
  Grid,
  Typography,
  Button,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  CalendarMonth as CalendarIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import NiceModal from "@ebay/nice-modal-react";
import { ChildScheduleView } from "../../../features/schedules/ChildScheduleView";
import { AbsenceList } from "../../../features/absence/AbsenceList";
import { AddAbsenceDialog } from "../../../features/absence/AddAbsenceDialog";

type PlanningTabProps = {
  childId: string;
};

export const PlanningTab: React.FC<PlanningTabProps> = ({ childId }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const onAddAbsenceClickHandler = () =>
    void NiceModal.show(AddAbsenceDialog, { childId: childId });

  return (
    <>
      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* Current Schedule Management */}
        <Grid size={{ xs: 12, xl: 6 }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, md: 3 },
              height: "100%",
              borderRadius: 2,
              backgroundColor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: { xs: 2, md: 3 } }}>
              <ScheduleIcon color="primary" />
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                {t("Current Schedule")}
              </Typography>
            </Box>

            <ChildScheduleView childId={childId} />
          </Paper>
        </Grid>
      </Grid>

      {/* Divider between sections */}
      <Divider sx={{ my: { xs: 3, md: 4 } }} />

      {/* Absence Management Section */}
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            mb: { xs: 2, md: 3 },
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 2, md: 2 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarIcon color="primary" />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              {t("Absence Management")}
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={onAddAbsenceClickHandler}
            startIcon={<AddIcon />}
            size={isMobile ? "large" : "medium"}
            fullWidth={isMobile}
            sx={{
              borderRadius: 2,
              minHeight: { xs: 48, md: "auto" }, // Larger touch target on mobile
              fontSize: { xs: "1rem", md: "0.875rem" }, // Larger text on mobile
              fontWeight: 600,
              px: { xs: 3, md: 2 },
            }}
          >
            {t("Add Absence")}
          </Button>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            backgroundColor: "background.paper",
          }}
        >
          <AbsenceList childId={childId} />
        </Paper>
      </Box>
    </>
  );
};
