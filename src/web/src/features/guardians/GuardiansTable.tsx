import { useMemo } from "react";
import { type GridColDef } from "@mui/x-data-grid/models";
import { DataGrid, type GridRenderCellParams } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import { useGuardiansListState } from "@hooks/useGuardiansListState";
import { DeleteGuardianButton } from "./DeleteGuardianButton";
import { ViewGuardianButton } from "./ViewGuardianButton";
import { useListGuardians } from "@api/endpoints/guardians/guardians";
import { type GuardianListVM } from "@api/models/guardianListVM";
import Stack from "@mui/material/Stack";

export const GuardiansTable = () => {
  const { apiParams, muiPagination } = useGuardiansListState();
  const { data, isLoading, isFetching } = useListGuardians(
    apiParams,
    {
      query: { placeholderData: keepPreviousData },
    },
  );

  const columns: GridColDef<GuardianListVM>[] = useMemo(
    () => [
      {
        field: "fullName",
        headerName: "Fullname",
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
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
        renderCell: (params: GridRenderCellParams<any, string>) => (
          <>
            <DeleteGuardianButton id={params.value!} displayName={params.row.fullName} />
            <ViewGuardianButton id={params.value!} />
          </>
        ),
      },
    ],
    [],
  );

  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
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
    </Stack>
  );
};
