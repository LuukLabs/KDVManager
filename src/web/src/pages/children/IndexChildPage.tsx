import { useTranslation } from "react-i18next";
import { ChildrenTable } from "@features/children/ChildrenTable";
import { ListPageLayout, ListPageAddButton } from "@components/layout/ListPageLayout";
import { useChildrenListState } from "@hooks/useListState";

const IndexChildPage = () => {
  const { t } = useTranslation();
  const { state, setSearch } = useChildrenListState();

  return (
    <ListPageLayout
      title={t("Children")}
      description={t("Manage and explore the registered children records.")}
      action={<ListPageAddButton label={t("Add child")} to="new" />}
      search={{
        value: state.search,
        onSearch: setSearch,
        placeholder: t("Search children…"),
        label: t("Search children"),
      }}
    >
      <ChildrenTable />
    </ListPageLayout>
  );
};

export const Component = IndexChildPage;
