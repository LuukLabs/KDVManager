import { useCallback, useState } from "react";
import { GroupListVM } from "@api/models";
import { GridColDef } from "@mui/x-data-grid/models/colDef";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import { useListGroups } from "@api/endpoints/groups/groups";
import { GridPaginationModel } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";

const columns: GridColDef[] = [{ field: "name", headerName: "Groep", flex: 1, sortable: false }];

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
    { query: { placeholderData: keepPreviousData } }
  );

  const paginationModelChange = useCallback(
    (model: GridPaginationModel) => setPaginationModel(model),
    []
  );

  return (
    <DataGrid<GroupListVM>
      autoHeight
      pageSizeOptions={[5, 10, 20]}
      paginationMode="server"
      paginationModel={paginationModel}
      rowCount={data?.meta?.total || 0}
      loading={isLoading || isFetching}
      columns={columns}
      rows={data?.value || []}
      onPaginationModelChange={paginationModelChange}
    />
  );
};

export default GroupsTable;
