import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type GridColDef } from "@mui/x-data-grid/models";
import { type GridRenderCellParams } from "@mui/x-data-grid";
import { type ClosurePeriod } from "@api/scheduling/models/closurePeriod";
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
        headerName: t("table.header.delete"),
        flex: 0.5,
        renderCell: (params: GridRenderCellParams<ClosurePeriod>) => (
          <DeleteClosurePeriodButton id={params.row.id!} />
        ),
      }),
    ],
    [t],
  );

  return (
    <AppDataGrid<ClosurePeriod>
      columns={columns}
      rows={Array.isArray(data) ? data : []}
      getRowId={(row) => String(row.id)}
      loading={isLoading}
    />
  );
};
