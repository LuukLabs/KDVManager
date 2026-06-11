import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type GridColDef } from "@mui/x-data-grid/models";
import { type GridRenderCellParams } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { keepPreviousData } from "@tanstack/react-query";
import { type GroupListVM } from "@api/scheduling/models/groupListVM";
import { useListGroups } from "@api/scheduling/endpoints/groups/groups";
import { getTotal } from "@api/mutator/executeFetchPaginated";
import { useGroupsListState } from "@hooks/useListState";
import { AppDataGrid } from "@components/datagrid/AppDataGrid";
import { staticColumn } from "@components/datagrid/staticColumn";
import { DeleteGroupButton } from "./DeleteGroupButton";

const GroupsTable = () => {
  const { t } = useTranslation();
  const { apiParams, muiPagination } = useGroupsListState();

  const { data, isLoading, isFetching } = useListGroups(apiParams, {
    query: { placeholderData: keepPreviousData },
  });

  const columns: GridColDef<GroupListVM>[] = useMemo(
    () => [
      staticColumn({
        field: "name",
        headerName: t("table.header.groupName"),
        flex: 1,
      }),
      staticColumn({
        field: "id",
        headerName: t("table.header.actions"),
        width: 120,
        align: "center",
        headerAlign: "center",
        renderCell: (params: GridRenderCellParams<GroupListVM, string>) => (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <DeleteGroupButton id={params.value!} displayName={params.row.name ?? ""} />
          </Box>
        ),
      }),
    ],
    [t],
  );

  return (
    <AppDataGrid<GroupListVM>
      rowCount={getTotal(data)}
      loading={isLoading || isFetching}
      columns={columns}
      rows={data ?? []}
      {...muiPagination}
    />
  );
};

export default GroupsTable;
