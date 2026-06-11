import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import NiceModal from "@ebay/nice-modal-react";
import { useTranslation } from "react-i18next";
import TimeSlotsTable from "../../features/timeSlots/TimeSlotsTable";
import { AddTimeSlotDialog } from "../../features/timeSlots/AddTimeSlotDialog";
import { ListPageHeader } from "@components/layout/ListPageHeader";

const SchedulingSettingsPage = () => {
  const { t } = useTranslation();

  const onAddTimeSlotClickHandler = () => void NiceModal.show(AddTimeSlotDialog);

  return (
    <Stack spacing={2} sx={{ pb: 2 }}>
      <ListPageHeader
        title={t("Time slots")}
        description={t("Define the time slots children can be scheduled for.")}
        action={
          <Button
            variant="contained"
            onClick={onAddTimeSlotClickHandler}
            startIcon={<AddIcon />}
            sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, minWidth: { sm: 160 } }}
          >
            {t("Add time slot")}
          </Button>
        }
      />
      <Paper elevation={0} sx={{ p: { xs: 1, sm: 2 }, borderRadius: 3 }}>
        <TimeSlotsTable />
      </Paper>
    </Stack>
  );
};

export const Component = SchedulingSettingsPage;
