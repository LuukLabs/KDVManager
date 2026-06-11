import { type GroupListVM } from "@api/scheduling/models/groupListVM";
// GridColDef type intentionally not imported here because columns are declared inline in the component
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import { useListGroups } from "@api/scheduling/endpoints/groups/groups";
import { getTotal } from "@api/mutator/executeFetchPaginated";
import { type GridRenderCellParams } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { keepPreviousData } from "@tanstack/react-query";
import { DeleteGroupButton } from "./DeleteGroupButton";
import { usePagination } from "@hooks/usePagination";

// columns are created inside the component so they can use the `t` hook

const GroupsTable = () => {
  const { t } = useTranslation();
  const { apiPagination, muiPagination } = usePagination();

  const { data, isLoading, isFetching } = useListGroups(apiPagination, {
    query: { placeholderData: keepPreviousData },
  });

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: t("table.header.groupName"),
        flex: 1,
        sortable: false,
        disableColumnMenu: true,
      },
      {
        field: "id",
        headerName: t("table.header.actions"),
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        disableReorder: true,
        width: 120,
        align: "center" as const,
        headerAlign: "center" as const,
        renderCell: (params: GridRenderCellParams<any, string>) => (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <DeleteGroupButton id={params.value!} displayName={params.row.name} />
          </Box>
        ),
      },
    ],
    [t],
  );

  return (
    <DataGrid<GroupListVM>
      autoHeight
      pageSizeOptions={[5, 10, 20]}
      rowCount={getTotal(data)}
      loading={isLoading || isFetching}
      columns={columns}
      rows={data ?? []}
      disableRowSelectionOnClick
      {...muiPagination}
    />
  );
};

export default GroupsTable;
