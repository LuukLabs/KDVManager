import { useMemo } from "react";
import { type GridColDef } from "@mui/x-data-grid/models";
import { DataGrid, type GridRenderCellParams } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import { usePagination } from "@hooks/usePagination";
import { DeleteGuardianButton } from "./DeleteGuardianButton";
import { ViewGuardianButton } from "./ViewGuardianButton";
import { useListGuardians } from "@api/endpoints/guardians/guardians";
import { type GuardianListVM } from "@api/models/guardianListVM";

export const GuardiansTable = ({ searchTerm = "" }: { searchTerm?: string }) => {
  const { apiPagination, muiPagination } = usePagination();
  const { data, isLoading, isFetching } = useListGuardians(
    { ...apiPagination, search: searchTerm },
    {
      query: { placeholderData: keepPreviousData },
    },
  );

  const columns: GridColDef<GuardianListVM>[] = useMemo(
    () => [
      {
        field: "fullName",
        headerName: "Full Name",
        flex: 2,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
      },
      {
        field: "email",
        headerName: "Email",
        flex: 2,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
      },
      {
        field: "primaryPhoneNumber",
        headerName: "Phone",
        flex: 1,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
      },
      {
        field: "childrenCount",
        headerName: "Children",
        width: 100,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
        type: "number",
      },
      {
        field: "id",
        headerName: "Actions",
        width: 150,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
        renderCell: (params: GridRenderCellParams<any, string>) => (
          <div style={{ display: "flex", gap: "8px" }}>
            <ViewGuardianButton id={params.value!} />
            <DeleteGuardianButton id={params.value!} displayName={params.row.fullName} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <DataGrid<GuardianListVM>
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
