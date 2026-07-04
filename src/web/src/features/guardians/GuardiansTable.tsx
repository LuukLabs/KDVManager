import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { type GridColDef } from "@mui/x-data-grid/models";
import {
  DataGrid,
  type GridCellParams,
  type GridRenderCellParams,
  type GridRowParams,
} from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import { useGuardiansListState } from "@hooks/useGuardiansListState";
import { DeleteGuardianButton } from "./DeleteGuardianButton";
import { ViewGuardianButton } from "./ViewGuardianButton";
import { useListGuardians } from "@api/crm/endpoints/guardians/guardians";
import { getTotal } from "@api/mutator/executeFetchPaginated";
import { type GuardianListVM } from "@api/crm/models/guardianListVM";
import Stack from "@mui/material/Stack";

const ACTIONS_FIELD = "id";

export const GuardiansTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { apiParams, muiPagination } = useGuardiansListState();
  const { data, isLoading, isFetching } = useListGuardians(apiParams, {
    query: { placeholderData: keepPreviousData },
  });

  const handleRowClick = useCallback(
    (params: GridRowParams<GuardianListVM>) => {
      if (params.row.id) {
        navigate(`/guardians/${params.row.id}`);
      }
    },
    [navigate],
  );

  const handleCellKeyDown = useCallback(
    (params: GridCellParams<GuardianListVM>, event: React.KeyboardEvent) => {
      if (event.key === "Enter" && params.field !== ACTIONS_FIELD && params.row.id) {
        navigate(`/guardians/${params.row.id}`);
      }
    },
    [navigate],
  );

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
        field: ACTIONS_FIELD,
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
        rowCount={getTotal(data)}
        loading={isLoading || isFetching}
        columns={columns}
        rows={data ?? []}
        disableRowSelectionOnClick
        onRowClick={handleRowClick}
        onCellKeyDown={handleCellKeyDown}
        sx={{ "& .MuiDataGrid-row": { cursor: "pointer" } }}
        {...muiPagination}
      />
    </Stack>
  );
};
