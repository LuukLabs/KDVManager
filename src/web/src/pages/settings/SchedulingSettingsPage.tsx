import Box from "@mui/system/Box";
import Typography from "@mui/material/Typography";
import TimeSlotsTable from "../../features/timeSlots/TimeSlotsTable";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import NiceModal from "@ebay/nice-modal-react";
import { AddTimeSlotDialog } from "../../features/timeSlots/AddTimeSlotDialog";

const SchedulingSettingsPage = () => {
  const { t } = useTranslation();

  const onAddTimeSlotClickHandler = () => void NiceModal.show(AddTimeSlotDialog);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {t("Time Slots")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {t("Manage time slots for scheduling.")}
          </Typography>
        </Box>
        <Button variant="contained" onClick={onAddTimeSlotClickHandler} startIcon={<AddIcon />}>
          {t("Time slot")}
        </Button>
      </Box>
      <Paper>
        <TimeSlotsTable />
      </Paper>
    </>
  );
};

export const Component = SchedulingSettingsPage;
