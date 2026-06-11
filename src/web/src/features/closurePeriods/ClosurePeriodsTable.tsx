// GridColDef type intentionally not imported here because columns are declared inline in the component
import { useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import Box from "@mui/material/Box";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useListClosurePeriods } from "@api/scheduling/endpoints/closure-periods/closure-periods";
import { DeleteClosurePeriodButton } from "./DeleteClosurePeriodButton";

// columns inside component using useMemo so translations update on language change

export const ClosurePeriodsTable = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useListClosurePeriods();

  const columns = useMemo(
    () => [
      {
        field: "reason",
        headerName: t("table.header.reason"),
        flex: 2,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
      },
      {
        field: "startDate",
        headerName: t("table.header.startDate"),
        flex: 1,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
        valueFormatter: (params: any) => params && dayjs(params).format("YYYY-MM-DD"),
      },
      {
        field: "endDate",
        headerName: t("table.header.endDate"),
        flex: 1,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
        valueFormatter: (params: any) => params && dayjs(params).format("YYYY-MM-DD"),
      },
      {
        field: "actions",
        headerName: t("table.header.actions"),
        width: 120,
        align: "center" as const,
        headerAlign: "center" as const,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        disableReorder: true,
        renderCell: (params: any) => (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <DeleteClosurePeriodButton id={params.row.id} />
          </Box>
        ),
      },
    ],
    [t],
  );

  return (
    <DataGrid
      columns={columns}
      rows={Array.isArray(data) ? data : []}
      getRowId={(row) => String(row.id)}
      loading={isLoading}
      disableRowSelectionOnClick
      pageSizeOptions={[5, 10, 20]}
    />
  );
};
