import { type GridColDef } from "@mui/x-data-grid/models";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import { keepPreviousData } from "@tanstack/react-query";
import { usePagination } from "@hooks/usePagination";
import { type GroupListVM } from "@api/models/groupListVM";
import { useListTimeSlots } from "@api/endpoints/time-slots/time-slots";
import { Box } from "@mui/material";
import dayjs from "dayjs";
import DeleteTimeSlotButton from "./DeleteTimeSlotButton";
import EditTimeSlotButton from "./EditTimeSlotButton";

// base column definitions are created inside the component via useMemo so translations update on language change

const TimeSlotsTable = () => {
  const { t } = useTranslation();
  const { apiPagination, muiPagination } = usePagination();

  const { data, isLoading, isFetching } = useListTimeSlots(apiPagination, {
    query: { placeholderData: keepPreviousData },
  });

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: t("table.header.name"),
        flex: 1,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
      },
      {
        field: "startTime",
        headerName: t("table.header.startTime"),
        flex: 1,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
        valueFormatter: (value: any) => value && dayjs(value, "HH:mm:ss").format("HH:mm"),
      },
      {
        field: "endTime",
        headerName: t("table.header.endTime"),
        flex: 1,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
        valueFormatter: (value: any) => value && dayjs(value, "HH:mm:ss").format("HH:mm"),
      },
      {
        field: "actions",
        headerName: t("table.header.actions"),
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        disableReorder: true,
        width: 120,
        align: "center",
        headerAlign: "center",
        renderCell: (params: GridRenderCellParams<any, any>) => (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <EditTimeSlotButton timeSlot={params.row as any} />
            <DeleteTimeSlotButton
              id={(params.row as any).id}
              displayName={(params.row as any).name}
            />
          </Box>
        ),
      },
    ],
    [t],
  );

  return (
    <DataGrid<GroupListVM>
      autoHeight
      pageSizeOptions={[5, 10, 20]}
      rowCount={data?.meta.total ?? 0}
      loading={isLoading || isFetching}
      columns={columns}
      rows={data?.value ?? []}
      disableRowSelectionOnClick
      {...muiPagination}
    />
  );
};

export default TimeSlotsTable;
