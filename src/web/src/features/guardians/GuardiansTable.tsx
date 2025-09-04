import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { apiParams, muiPagination } = useGuardiansListState();
  const { data, isLoading, isFetching } = useListGuardians(apiParams, {
    query: { placeholderData: keepPreviousData },
  });
  const columns: GridColDef<GuardianListVM>[] = useMemo(
    () => [
      {
        field: "fullName",
        headerName: t("table.header.fullName"),
        flex: 2,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
      },
      {
        field: "email",
        headerName: t("table.header.email"),
        flex: 2,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
      },
      {
        field: "primaryPhoneNumber",
        headerName: t("table.header.phone"),
        flex: 1,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
      },
      {
        field: "childrenCount",
        headerName: t("table.header.children"),
        width: 100,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
        type: "number",
      },
      {
        field: "id",
        headerName: t("table.header.actions"),
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
    [t],
  );

  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      <DataGrid<GuardianListVM>
        autoHeight
        pageSizeOptions={[5, 10, 20]}
        rowCount={data?.meta.total ?? 0}
        loading={isLoading || isFetching}
        columns={columns}
        rows={data?.value ?? []}
        disableRowSelectionOnClick
        {...muiPagination}
      />
    </Stack>
  );
};
