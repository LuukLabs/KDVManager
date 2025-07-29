import { type GridColDef } from "@mui/x-data-grid/models";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useListClosurePeriods } from "@api/endpoints/closure-periods/closure-periods";
import { DeleteClosurePeriodButton } from "./DeleteClosurePeriodButton";

const getColumns = (t: (key: string) => string): GridColDef[] => [
  {
    field: "reason",
    headerName: "Reason",
    flex: 2,
    sortable: false,
    disableColumnMenu: true,
    disableReorder: true,
  },
  {
    field: "startDate",
    headerName: "Start Date",
    flex: 1,
    sortable: false,
    disableColumnMenu: true,
    disableReorder: true,
    valueFormatter: (params) => params && dayjs(params).format("YYYY-MM-DD"),
  },
  {
    field: "endDate",
    headerName: "End Date",
    flex: 1,
    sortable: false,
    disableColumnMenu: true,
    disableReorder: true,
    valueFormatter: (params) => params && dayjs(params).format("YYYY-MM-DD"),
  },
  {
    field: "actions",
    headerName: t("Delete"),
    flex: 0.5,
    sortable: false,
    disableColumnMenu: true,
    disableReorder: true,
    renderCell: (params) => <DeleteClosurePeriodButton id={params.row.id} />,
  },
];

export const ClosurePeriodsTable = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useListClosurePeriods();

  return (
    <DataGrid
      columns={getColumns(t)}
      rows={Array.isArray(data) ? data : []}
      getRowId={(row) => row.id}
      loading={isLoading}
      disableRowSelectionOnClick
      pageSizeOptions={[5, 10, 20]}
    />
  );
};
