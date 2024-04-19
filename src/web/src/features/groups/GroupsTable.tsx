import { useCallback, useState } from "react";
import { GroupListVM } from "@api/models";
import { GridColDef } from "@mui/x-data-grid/models/colDef";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import { useListGroups } from "@api/endpoints/groups/groups";
import { GridPaginationModel, GridRenderCellParams } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import IconButton from "@mui/material/IconButton/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { DeleteGroupButton } from "./DeleteGroupButton";

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
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const { data, isLoading, isFetching } = useListGroups(
    {
      PageNumber: paginationModel.page + 1,
      PageSize: paginationModel.pageSize,
    },
    { query: { placeholderData: keepPreviousData } },
  );

  const paginationModelChange = useCallback((model: GridPaginationModel) => {
    setPaginationModel(model);
  }, []);

  return (
    <DataGrid<GroupListVM>
      autoHeight
      pageSizeOptions={[5, 10, 20]}
      paginationMode="server"
      paginationModel={paginationModel}
      rowCount={data?.meta.total || 0}
      loading={isLoading || isFetching}
      columns={columns}
      rows={data?.value || []}
      onPaginationModelChange={paginationModelChange}
    />
  );
};

export default GroupsTable;
