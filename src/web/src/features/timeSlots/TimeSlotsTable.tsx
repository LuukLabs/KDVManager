import { type GridColDef } from "@mui/x-data-grid/models/colDef";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import { keepPreviousData } from "@tanstack/react-query";
import { usePagination } from "@hooks/usePagination";
import { type GroupListVM } from "@api/models/groupListVM";
import { useListTimeSlots } from "@api/endpoints/time-slots/time-slots";
import dayjs from "dayjs";

const columns: GridColDef[] = [
  {
    field: "name",
    headerName: "Name",
    flex: 1,
    sortable: false,
    disableColumnMenu: true,
    disableReorder: true,
  },
  {
    field: "startTime",
    headerName: "Start time",
    flex: 1,
    sortable: false,
    disableColumnMenu: true,
    disableReorder: true,
    valueFormatter: (value) => value && dayjs(value, "HH:mm:ss").format("HH:mm"),
  },
  {
    field: "endTime",
    headerName: "End time",
    flex: 1,
    sortable: false,
    disableColumnMenu: true,
    disableReorder: true,
    valueFormatter: (value) => value && dayjs(value, "HH:mm:ss").format("HH:mm"),
  },
];

const TimeSlotsTable = () => {
  const { apiPagination, muiPagination } = usePagination();

  const { data, isLoading, isFetching } = useListTimeSlots(apiPagination, {
    query: { placeholderData: keepPreviousData },
  });

  return (
    <DataGrid<GroupListVM>
      autoHeight
      pageSizeOptions={[5, 10, 20]}
      rowCount={data?.meta.total || 0}
      loading={isLoading || isFetching}
      columns={columns}
      rows={data?.value || []}
      disableRowSelectionOnClick
      {...muiPagination}
    />
  );
};

export default TimeSlotsTable;
