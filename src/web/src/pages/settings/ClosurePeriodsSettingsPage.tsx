import { useTranslation } from "react-i18next";
import NiceModal from "@ebay/nice-modal-react";
import { ClosurePeriodsTable } from "@features/closurePeriods/ClosurePeriodsTable";
import { AddClosurePeriodDialog } from "@features/closurePeriods/AddClosurePeriodDialog";
import { ListPageLayout, ListPageAddButton } from "@components/layout/ListPageLayout";

const ClosurePeriodsSettingsPage = () => {
  const { t } = useTranslation();

  const onAddClickHandler = () => void NiceModal.show(AddClosurePeriodDialog);

  return (
    <ListPageLayout
      title={t("Closure Periods")}
      description={t("Manage the periods the daycare is closed.")}
      action={<ListPageAddButton label={t("Add Closure Period")} onClick={onAddClickHandler} />}
    >
      <ClosurePeriodsTable />
    </ListPageLayout>
  );
};

export const Component = ClosurePeriodsSettingsPage;
