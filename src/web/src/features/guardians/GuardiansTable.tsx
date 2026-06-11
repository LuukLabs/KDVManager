import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type GridColDef } from "@mui/x-data-grid/models";
import { DataGrid, type GridRenderCellParams } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import { useGuardiansListState } from "@hooks/useGuardiansListState";
import { DeleteGuardianButton } from "./DeleteGuardianButton";
import { ViewGuardianButton } from "./ViewGuardianButton";
import { useListGuardians } from "@api/crm/endpoints/guardians/guardians";
import { getTotal } from "@api/mutator/executeFetchPaginated";
import { type GuardianListVM } from "@api/crm/models/guardianListVM";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

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
        filterable: false,
        disableColumnMenu: true,
        disableReorder: true,
        width: 120,
        align: "center",
        headerAlign: "center",
        renderCell: (params: GridRenderCellParams<any, string>) => (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <ViewGuardianButton id={params.value!} />
            <DeleteGuardianButton id={params.value!} displayName={params.row.fullName} />
          </Box>
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
        rowCount={getTotal(data)}
        loading={isLoading || isFetching}
        columns={columns}
        rows={data ?? []}
        disableRowSelectionOnClick
        {...muiPagination}
      />
    </Stack>
  );
};
