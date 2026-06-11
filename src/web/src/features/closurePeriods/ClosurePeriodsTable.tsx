import { useMemo } from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { type GridColDef } from "@mui/x-data-grid/models";
import { type GridRenderCellParams } from "@mui/x-data-grid";
import { type ClosurePeriodListVM as ClosurePeriod } from "@api/scheduling/models/closurePeriodListVM";
import { useListClosurePeriods } from "@api/scheduling/endpoints/closure-periods/closure-periods";
import { formatDate } from "@utils/formatDate";
import { AppDataGrid } from "@components/datagrid/AppDataGrid";
import { staticColumn } from "@components/datagrid/staticColumn";
import { DeleteClosurePeriodButton } from "./DeleteClosurePeriodButton";

export const ClosurePeriodsTable = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useListClosurePeriods();

  const columns: GridColDef<ClosurePeriod>[] = useMemo(
    () => [
      staticColumn({
        field: "reason",
        headerName: t("table.header.reason"),
        flex: 2,
      }),
      staticColumn({
        field: "startDate",
        headerName: t("table.header.startDate"),
        flex: 1,
        valueFormatter: (value: string | undefined) => value && formatDate(value),
      }),
      staticColumn({
        field: "endDate",
        headerName: t("table.header.endDate"),
        flex: 1,
        valueFormatter: (value: string | undefined) => value && formatDate(value),
      }),
      staticColumn({
        field: "actions",
        headerName: t("table.header.actions"),
        width: 120,
        align: "center",
        headerAlign: "center",
        filterable: false,
        renderCell: (params: GridRenderCellParams<ClosurePeriod>) => (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            {params.row.id && <DeleteClosurePeriodButton id={params.row.id} />}
          </Box>
        ),
      }),
    ],
    [t],
  );

  return (
    <AppDataGrid<ClosurePeriod>
      columns={columns}
      rows={Array.isArray(data) ? data : []}
      getRowId={(row) => row.id ?? `${row.startDate}-${row.endDate}-${row.reason}`}
      loading={isLoading}
    />
  );
};
