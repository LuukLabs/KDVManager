import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth0 } from "@auth0/auth0-react";
import { type GridColDef } from "@mui/x-data-grid/models";
import { DataGrid, type GridRenderCellParams } from "@mui/x-data-grid";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { useListAdministrators } from "@api/crm/endpoints/administrators/administrators";
import { type AdministratorListVM } from "@api/crm/models/administratorListVM";
import { DeleteAdministratorButton } from "./DeleteAdministratorButton";
import { RevokeInvitationButton } from "./RevokeInvitationButton";

export const AdministratorsTable = () => {
  const { t } = useTranslation();
  const { user } = useAuth0();
  const { data, isLoading, isFetching } = useListAdministrators();

  const columns: GridColDef<AdministratorListVM>[] = useMemo(
    () => [
      {
        field: "email",
        headerName: t("table.header.email"),
        flex: 2,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
      },
      {
        field: "name",
        headerName: t("table.header.name"),
        flex: 2,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
      },
      {
        field: "status",
        headerName: t("table.header.status"),
        width: 140,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
        renderCell: (params: GridRenderCellParams<AdministratorListVM, string>) => (
          <Chip
            size="small"
            label={params.value === "Pending" ? t("Pending") : t("Active")}
            color={params.value === "Pending" ? "warning" : "success"}
            variant="outlined"
          />
        ),
      },
      {
        field: "id",
        headerName: t("table.header.actions"),
        width: 100,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
        renderCell: (params: GridRenderCellParams<AdministratorListVM, string>) =>
          params.row.status === "Pending" ? (
            <RevokeInvitationButton invitationId={params.value!} email={params.row.email} />
          ) : (
            <DeleteAdministratorButton
              userId={params.value!}
              email={params.row.email}
              disabled={!!user?.sub && user.sub === params.value}
            />
          ),
      },
    ],
    [t, user],
  );

  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      <DataGrid<AdministratorListVM>
        autoHeight
        getRowId={(row) => row.id}
        pageSizeOptions={[5, 10, 20]}
        loading={isLoading || isFetching}
        columns={columns}
        rows={data ?? []}
        disableRowSelectionOnClick
      />
    </Stack>
  );
};
