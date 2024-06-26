import { type GridColDef } from "@mui/x-data-grid/models/colDef";
import { DataGrid, type GridRenderCellParams } from "@mui/x-data-grid";
import { type ChildListVM } from "@api/models/childListVM";
import { keepPreviousData } from "@tanstack/react-query";
import { useGetAllChildren } from "@api/endpoints/children/children";
import { usePagination } from "@hooks/usePagination";
import dayjs from "dayjs";
import { DeleteChildButton } from "./DeleteChildButton";
import { EditChildButton } from "./EditChildButton";

const columns: GridColDef[] = [
  {
    field: "fullName",
    headerName: "Fullname",
    flex: 1,
    disableColumnMenu: true,
    disableReorder: true,
  },
  {
    field: "dateOfBirth",
    headerName: "Birthdate",
    flex: 1,
    disableColumnMenu: true,
    disableReorder: true,
    valueFormatter: (value) => dayjs(value).format("DD/MM/YYYY"),
  },
  {
    field: "id",
    headerName: "Actions",
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params: GridRenderCellParams<any, string>) => (
      <>
        <DeleteChildButton id={params.value!} fullName={params.row.fullName} />
        <EditChildButton id={params.value!} />
      </>
    ),
  },
];

export const ChildrenTable = () => {
  const { apiPagination, muiPagination } = usePagination();
  const { data, isLoading, isFetching } = useGetAllChildren(apiPagination, {
    query: { placeholderData: keepPreviousData },
  });

  return (
    <DataGrid<ChildListVM>
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
