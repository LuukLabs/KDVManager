import { useTranslation } from "react-i18next";
import { GuardiansTable } from "@features/guardians/GuardiansTable";
import { ListPageLayout, ListPageAddButton } from "@components/layout/ListPageLayout";
import { useGuardiansListState } from "@hooks/useListState";

const GuardiansPage = () => {
  const { t } = useTranslation();
  const { state, setSearch } = useGuardiansListState();

  return (
    <ListPageLayout
      title={t("Guardians")}
      description={t("Manage and explore the registered guardian records.")}
      action={<ListPageAddButton label={t("Add Guardian")} to="new" />}
      search={{
        value: state.search,
        onSearch: setSearch,
        placeholder: t("Search guardians…"),
        label: t("Search guardians"),
      }}
    >
      <GuardiansTable />
    </ListPageLayout>
  );
};

export const Component = GuardiansPage;
