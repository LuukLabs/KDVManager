import { useTranslation } from "react-i18next";
import NiceModal from "@ebay/nice-modal-react";
import GroupsTable from "@features/groups/GroupsTable";
import { AddGroupDialog } from "@features/groups/AddGroupDialog";
import { ListPageLayout, ListPageAddButton } from "@components/layout/ListPageLayout";

const ListGroupsPage = () => {
  const { t } = useTranslation();

  const onAddGroupClickHandler = () => void NiceModal.show(AddGroupDialog);

  return (
    <ListPageLayout
      title={t("Groups")}
      description={t("Manage the groups children can be scheduled in.")}
      action={<ListPageAddButton label={t("Add group")} onClick={onAddGroupClickHandler} />}
    >
      <GroupsTable />
    </ListPageLayout>
  );
};

export const Component = ListGroupsPage;
