import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type GridColDef } from "@mui/x-data-grid/models";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import dayjs from "dayjs";
import { type TimeSlotListVM } from "@api/scheduling/models/timeSlotListVM";
import { useListTimeSlots } from "@api/scheduling/endpoints/time-slots/time-slots";
import { getTotal } from "@api/mutator/executeFetchPaginated";
import { useTimeSlotsListState } from "@hooks/useListState";
import { AppDataGrid } from "@components/datagrid/AppDataGrid";
import { staticColumn } from "@components/datagrid/staticColumn";
import Box from "@mui/material/Box";
import DeleteTimeSlotButton from "./DeleteTimeSlotButton";
import EditTimeSlotButton from "./EditTimeSlotButton";

const formatTime = (value: string | undefined) => value && dayjs(value, "HH:mm:ss").format("HH:mm");

const TimeSlotsTable = () => {
  const { t } = useTranslation();
  const { apiParams, muiPagination } = useTimeSlotsListState();

  const { data, isLoading, isFetching, error, refetch } = useListTimeSlots(apiParams, {
    query: { placeholderData: keepPreviousData },
  });

  const columns: GridColDef<TimeSlotListVM>[] = useMemo(
    () => [
      staticColumn({
        field: "name",
        headerName: t("table.header.name"),
        flex: 1,
      }),
      staticColumn({
        field: "startTime",
        headerName: t("table.header.startTime"),
        flex: 1,
        valueFormatter: formatTime,
      }),
      staticColumn({
        field: "endTime",
        headerName: t("table.header.endTime"),
        flex: 1,
        valueFormatter: formatTime,
      }),
      staticColumn({
        field: "actions",
        headerName: t("table.header.actions"),
        filterable: false,
        width: 120,
        align: "center",
        headerAlign: "center",
        renderCell: (params: GridRenderCellParams<TimeSlotListVM>) => (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <EditTimeSlotButton timeSlot={params.row} />
            {params.row.id && (
              <DeleteTimeSlotButton id={params.row.id} displayName={params.row.name ?? ""} />
            )}
          </Box>
        ),
      }),
    ],
    [t],
  );

  return (
    <AppDataGrid<TimeSlotListVM>
      rowCount={getTotal(data)}
      loading={isLoading || isFetching}
      error={error}
      onRetry={refetch}
      columns={columns}
      rows={data ?? []}
      getRowId={(row) => row.id ?? `${row.name}-${row.startTime}-${row.endTime}`}
      {...muiPagination}
    />
  );
};

export default TimeSlotsTable;
