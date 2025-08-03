import { useMemo } from "react";
import { type GridColDef } from "@mui/x-data-grid/models";
import { DataGrid, type GridRenderCellParams } from "@mui/x-data-grid";
import { type ChildListVM } from "@api/models/childListVM";
import { keepPreviousData } from "@tanstack/react-query";
import { useGetAllChildren } from "@api/endpoints/children/children";
import { usePagination } from "@hooks/usePagination";
import dayjs from "dayjs";
import { DeleteChildButton } from "./DeleteChildButton";
import { EditChildButton } from "./EditChildButton";

export const ChildrenTable = ({ showArchived = false }: { showArchived?: boolean }) => {
  const { apiPagination, muiPagination } = usePagination();
  const { data, isLoading, isFetching } = useGetAllChildren(
    { ...apiPagination, archived: showArchived },
    {
      query: { placeholderData: keepPreviousData },
    },
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "fullName",
        headerName: "Fullname",
        flex: 1,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
      },
      {
        field: "dateOfBirth",
        headerName: "Birthdate",
        flex: 1,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
        valueFormatter: (value) => value && dayjs(value).format("DD/MM/YYYY"),
      },
      {
        field: "id",
        headerName: "Actions",
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
        renderCell: (params: GridRenderCellParams<ChildListVM, string>) => (
          <>
            <DeleteChildButton id={params.value!} displayName={params.row.fullName!} />
            <EditChildButton id={params.value!} />
          </>
        ),
      },
    ],
    [],
  );

  return (
    <DataGrid<ChildListVM>
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
