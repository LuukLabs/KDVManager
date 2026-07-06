import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type GridColDef } from "@mui/x-data-grid/models";
import { type GridRenderCellParams } from "@mui/x-data-grid";
import { type AdministratorListVM } from "@api/crm/models/administratorListVM";
import { useListAdministrators } from "@api/crm/endpoints/administrators/administrators";
import { formatDate } from "@utils/formatDate";
import { AppDataGrid } from "@components/datagrid/AppDataGrid";
import { staticColumn } from "@components/datagrid/staticColumn";
import { DeleteAdministratorButton } from "./DeleteAdministratorButton";

export const AdministratorsTable = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useListAdministrators({});

  const columns: GridColDef<AdministratorListVM>[] = useMemo(
    () => [
      staticColumn({
        field: "name",
        headerName: t("table.header.name"),
        flex: 2,
      }),
      staticColumn({
        field: "email",
        headerName: t("table.header.email"),
        flex: 2,
      }),
      staticColumn({
        field: "createdAt",
        headerName: t("table.header.createdAt"),
        flex: 1,
        valueFormatter: (value: string | undefined) => value && formatDate(value),
      }),
      staticColumn({
        field: "actions",
        headerName: t("table.header.delete"),
        flex: 0.5,
        renderCell: (params: GridRenderCellParams<AdministratorListVM>) =>
          params.row.id ? <DeleteAdministratorButton id={params.row.id} /> : null,
      }),
    ],
    [t],
  );

  return (
    <AppDataGrid<AdministratorListVM>
      columns={columns}
      rows={Array.isArray(data) ? data : []}
      getRowId={(row) => row.id}
      loading={isLoading}
    />
  );
};
