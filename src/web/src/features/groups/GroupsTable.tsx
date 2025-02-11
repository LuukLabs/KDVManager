import { type GroupListVM } from "@api/models/groupListVM";
import { type GridColDef } from "@mui/x-data-grid/models";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import { useListGroups } from "@api/endpoints/groups/groups";
import { type GridRenderCellParams } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import { DeleteGroupButton } from "./DeleteGroupButton";
import { usePagination } from "@hooks/usePagination";

const columns: GridColDef[] = [
  { field: "name", headerName: "Groep", flex: 1, sortable: false, disableColumnMenu: true },
  {
    field: "id",
    headerName: "Actions",
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params: GridRenderCellParams<any, string>) => (
      <DeleteGroupButton id={params.value!} />
    ),
  },
];

const GroupsTable = () => {
  const { apiPagination, muiPagination } = usePagination();

  const { data, isLoading, isFetching } = useListGroups(apiPagination, {
    query: { placeholderData: keepPreviousData },
  });

  return (
    <DataGrid<GroupListVM>
      autoHeight
      pageSizeOptions={[5, 10, 20]}
      rowCount={data?.meta.total || 0}
      loading={isLoading || isFetching}
      columns={columns}
      rows={data?.value || []}
      disableRowSelectionOnClick
      {...muiPagination}
    />
  );
};

export default GroupsTable;
