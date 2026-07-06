import { useTranslation } from "react-i18next";
import NiceModal from "@ebay/nice-modal-react";
import { AdministratorsTable } from "@features/administrators/AdministratorsTable";
import { AddAdministratorDialog } from "@features/administrators/AddAdministratorDialog";
import { ListPageLayout, ListPageAddButton } from "@components/layout/ListPageLayout";

const AdministratorsSettingsPage = () => {
  const { t } = useTranslation();

  const onAddClickHandler = () => void NiceModal.show(AddAdministratorDialog);

  return (
    <ListPageLayout
      title={t("Administrators")}
      description={t("Manage the administrators who can log in to KDVManager.")}
      action={<ListPageAddButton label={t("Add Administrator")} onClick={onAddClickHandler} />}
    >
      <AdministratorsTable />
    </ListPageLayout>
  );
};

export const Component = AdministratorsSettingsPage;
