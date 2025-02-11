import { useCallback, useState } from "react";
import { type GridColDef } from "@mui/x-data-grid/models";
import { DataGrid, type GridPaginationModel } from "@mui/x-data-grid";
import { type ChildListVM } from "@api/models/childListVM";
import { keepPreviousData } from "@tanstack/react-query";
import { useGetAllPeople } from "@api/endpoints/people/people";

const columns: GridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 90,
    disableColumnMenu: true,
    disableReorder: true,
  },
  {
    field: "fullName",
    headerName: "Fullname",
    flex: 1,
    disableColumnMenu: true,
    disableReorder: true,
  },
];

export const PeopleTable = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading, isFetching } = useGetAllPeople(
    {
      PageNumber: paginationModel.page,
      PageSize: paginationModel.pageSize,
    },
    { query: { placeholderData: keepPreviousData } },
  );

  const paginationModelChange = useCallback((model: GridPaginationModel) => {
    setPaginationModel(model);
  }, []);

  return (
    <DataGrid<ChildListVM>
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
