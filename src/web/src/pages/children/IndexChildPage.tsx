import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChildrenTable } from "../../features/children/ChildrenTable";
import { ListPageHeader } from "@components/layout/ListPageHeader";
import { useChildrenListState } from "@hooks/useChildrenListState";

const IndexChildPage = () => {
  const { t } = useTranslation();
  const { state, setSearch } = useChildrenListState();
  const [searchInput, setSearchInput] = useState(state.search);

  // Debounce search input (300ms)
  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== state.search) setSearch(searchInput);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput, state.search, setSearch]);

  return (
    <Stack spacing={2} sx={{ pb: 2 }}>
      <ListPageHeader
        title={t("Children")}
        description={t("Manage and explore the registered children records.")}
        action={
          <Button
            variant="contained"
            component={Link}
            to="new"
            startIcon={<AddIcon />}
            sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, minWidth: { sm: 160 } }}
          >
            {t("Add child")}
          </Button>
        }
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder={t("Search children…")}
        searchLabel={t("Search children")}
      />
      <Paper elevation={0} sx={{ p: { xs: 1, sm: 2 }, borderRadius: 3 }}>
        <ChildrenTable />
      </Paper>
    </Stack>
  );
};

export const Component = IndexChildPage;
