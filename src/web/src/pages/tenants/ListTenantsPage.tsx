import { useTranslation } from "react-i18next";
import NiceModal from "@ebay/nice-modal-react";
import TenantsTable from "@features/tenants/TenantsTable";
import { AddTenantDialog } from "@features/tenants/AddTenantDialog";
import { ListPageLayout, ListPageAddButton } from "@components/layout/ListPageLayout";

const ListTenantsPage = () => {
  const { t } = useTranslation();

  const onAddTenantClickHandler = () => void NiceModal.show(AddTenantDialog);

  return (
    <ListPageLayout
      title={t("Tenants")}
      description={t("Manage tenants.")}
      action={<ListPageAddButton label={t("Add tenant")} onClick={onAddTenantClickHandler} />}
    >
      <TenantsTable />
    </ListPageLayout>
  );
};

export const Component = ListTenantsPage;
