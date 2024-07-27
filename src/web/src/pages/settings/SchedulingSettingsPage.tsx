import Box from "@mui/system/Box";
import TimeSlotsTable from "../../features/timeSlots/TimeSlotsTable";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import NiceModal from "@ebay/nice-modal-react";
import { AddTimeSlotDialog } from "../../features/timeSlots/AddTimeSlotDialog";

const SchedulingSettingsPage = () => {
  const { t } = useTranslation();

  const onAddTimeSlotClickHandler = () => void NiceModal.show(AddTimeSlotDialog);

  return (
    <Paper>
      <Toolbar>
        <Box display="flex" flexGrow={1} />
        <Button variant="contained" onClick={onAddTimeSlotClickHandler} startIcon={<AddIcon />}>
          {t("Time slot")}
        </Button>
      </Toolbar>
      <TimeSlotsTable />
    </Paper>
  );
};

export const Component = SchedulingSettingsPage;
