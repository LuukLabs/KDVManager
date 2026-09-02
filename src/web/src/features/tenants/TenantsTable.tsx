import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type GridColDef } from "@mui/x-data-grid/models";
import { type GridRenderCellParams } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import NiceModal from "@ebay/nice-modal-react";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import { type TenantListVM } from "@api/tenants/models/tenantListVM";
import { useListTenants } from "@api/tenants/endpoints/tenants/tenants";
import { getTotal } from "@api/mutator/executeFetchPaginated";
import { useTenantsListState } from "@hooks/useListState";
import { AppDataGrid } from "@components/datagrid/AppDataGrid";
import { staticColumn } from "@components/datagrid/staticColumn";
import { formatDate } from "../../utils/formatDate";
import { TenantStatusSwitch } from "./TenantStatusSwitch";
import { EditTenantDialog } from "./EditTenantDialog";

const TenantsTable = () => {
  const { t } = useTranslation();
  const { apiParams, muiPagination } = useTenantsListState();

  const { data, isLoading, isFetching } = useListTenants(apiParams, {
    query: { placeholderData: keepPreviousData },
  });

  const columns: GridColDef<TenantListVM>[] = useMemo(
    () => [
      staticColumn({
        field: "name",
        headerName: t("table.header.tenantName", "Name"),
        flex: 1,
      }),
      staticColumn({
        field: "createdAt",
        headerName: t("table.header.createdAt", "Created"),
        width: 140,
        valueFormatter: (value: string) => formatDate(value),
      }),
      staticColumn({
        field: "isActive",
        headerName: t("table.header.tenantStatus", "Active"),
        width: 100,
        renderCell: (params: GridRenderCellParams<TenantListVM, boolean>) => (
          <TenantStatusSwitch
            id={params.row.id}
            isActive={!!params.value}
            name={params.row.name}
          />
        ),
      }),
      staticColumn({
        field: "id",
        headerName: t("table.header.actions"),
        renderCell: (params: GridRenderCellParams<TenantListVM, string>) => (
          <IconButton
            size="small"
            aria-label={t("edit_aria-label", { ns: "common" })}
            onClick={() =>
              void NiceModal.show(EditTenantDialog, {
                id: params.value!,
                name: params.row.name,
              })
            }
          >
            <EditIcon fontSize="small" />
          </IconButton>
        ),
      }),
    ],
    [t],
  );

  return (
    <AppDataGrid<TenantListVM>
      rowCount={getTotal(data)}
      loading={isLoading || isFetching}
      columns={columns}
      rows={data ?? []}
      {...muiPagination}
    />
  );
};

export default TenantsTable;
