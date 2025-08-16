import { Box, Grid, Typography, Button, Divider, Paper } from "@mui/material";
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

  const onAddAbsenceClickHandler = () =>
    void NiceModal.show(AddAbsenceDialog, { childId: childId });

  return (
    <>
      <Grid container spacing={4}>
        {/* Current Schedule Management */}
        <Grid size={{ xs: 12, xl: 6 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 2,
              backgroundColor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
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
      <Divider sx={{ my: 4 }} />

      {/* Absence Management Section */}
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
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
            size="medium"
            sx={{ borderRadius: 2 }}
          >
            {t("Add Absence")}
          </Button>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
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
