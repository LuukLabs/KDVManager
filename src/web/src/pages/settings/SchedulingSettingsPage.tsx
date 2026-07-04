import { useTranslation } from "react-i18next";
import NiceModal from "@ebay/nice-modal-react";
import TimeSlotsTable from "@features/timeSlots/TimeSlotsTable";
import { AddTimeSlotDialog } from "@features/timeSlots/AddTimeSlotDialog";
import { ListPageLayout, ListPageAddButton } from "@components/layout/ListPageLayout";

const SchedulingSettingsPage = () => {
  const { t } = useTranslation();

  const onAddTimeSlotClickHandler = () => void NiceModal.show(AddTimeSlotDialog);

  return (
    <ListPageLayout
      title={t("Time Slots")}
      description={t("Manage the time slots available for scheduling.")}
      action={<ListPageAddButton label={t("Add time slot")} onClick={onAddTimeSlotClickHandler} />}
    >
      <TimeSlotsTable />
    </ListPageLayout>
  );
};

export const Component = SchedulingSettingsPage;
