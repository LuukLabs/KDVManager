import { type GroupListVM } from "@api/models/groupListVM";
// GridColDef type intentionally not imported here because columns are declared inline in the component
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import { useListGroups } from "@api/endpoints/groups/groups";
import { type GridRenderCellParams } from "@mui/x-data-grid";
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
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams<any, string>) => (
          <DeleteGroupButton id={params.value!} displayName={params.row.name} />
        ),
      },
    ],
    [t],
  );

  return (
    <DataGrid<GroupListVM>
      autoHeight
      pageSizeOptions={[5, 10, 20]}
      rowCount={data?.meta.total ?? 0}
      loading={isLoading ?? isFetching}
      columns={columns}
      rows={data?.value ?? []}
      disableRowSelectionOnClick
      {...muiPagination}
    />
  );
};

export default GroupsTable;
