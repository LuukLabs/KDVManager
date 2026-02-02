import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type GridColDef } from "@mui/x-data-grid/models";
import { DataGrid, type GridRenderCellParams } from "@mui/x-data-grid";
import { type ChildListVM } from "@api/models/childListVM";
import {
  ChildSchedulingStatus,
  type ChildSchedulingStatus as ChildSchedulingStatusType,
} from "@api/models/childSchedulingStatus";
import { keepPreviousData } from "@tanstack/react-query";
import { useListChildren } from "@api/endpoints/children/children";
import { useChildrenListState } from "@hooks/useChildrenListState";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import dayjs from "dayjs";
import { DeleteChildButton } from "./DeleteChildButton";
import { EditChildButton } from "./EditChildButton";

const getStatusConfig = (
  status: ChildSchedulingStatusType,
  statusRelevantDate: string | null | undefined,
  t: (key: string, options?: Record<string, unknown>) => string,
) => {
  switch (status) {
    case ChildSchedulingStatus.Active:
      return {
        label: statusRelevantDate
          ? t("status.activeUntil", { date: dayjs(statusRelevantDate).format("DD/MM/YYYY") })
          : t("status.active"),
        color: "success" as const,
      };
    case ChildSchedulingStatus.Upcoming:
      return {
        label: statusRelevantDate
          ? t("status.upcomingFrom", { date: dayjs(statusRelevantDate).format("DD/MM/YYYY") })
          : t("status.upcoming"),
        color: "info" as const,
      };
    case ChildSchedulingStatus.Past:
      return {
        label: t("status.past"),
        color: "default" as const,
      };
    case ChildSchedulingStatus.NoPlanning:
    default:
      return {
        label: t("status.noPlanning"),
        color: "warning" as const,
      };
  }
};

export const ChildrenTable = () => {
  const { t } = useTranslation();
  const { apiParams, muiPagination } = useChildrenListState();
  const { data, isLoading, isFetching } = useListChildren(
    { ...apiParams },
    {
      query: { placeholderData: keepPreviousData },
    },
  );

  const columns: GridColDef<ChildListVM>[] = useMemo(
    () => [
      {
        field: "childNumber",
        headerName: t("table.header.childNumber"),
        width: 100,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
      },
      {
        field: "fullName",
        headerName: t("table.header.fullName"),
        flex: 1,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
      },
      {
        field: "dateOfBirth",
        headerName: t("table.header.dateOfBirth"),
        flex: 1,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
        valueFormatter: (value) => value && dayjs(value).format("DD/MM/YYYY"),
      },
      {
        field: "schedulingStatus",
        headerName: t("table.header.status"),
        width: 200,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
        renderCell: (params: GridRenderCellParams<ChildListVM, ChildSchedulingStatusType>) => {
          const config = getStatusConfig(
            params.value ?? ChildSchedulingStatus.NoPlanning,
            params.row.statusRelevantDate,
            t,
          );
          return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
        },
      },
      {
        field: "id",
        headerName: t("table.header.actions"),
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
        renderCell: (params: GridRenderCellParams<any, string>) => (
          <>
            <DeleteChildButton id={params.value!} displayName={params.row.fullName} />
            <EditChildButton id={params.value!} />
          </>
        ),
      },
    ],
    [t],
  );

  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      <DataGrid<ChildListVM>
        autoHeight
        pageSizeOptions={[5, 10, 20]}
        rowCount={data?.meta.total ?? 0}
        loading={isLoading || isFetching}
        columns={columns}
        rows={data?.value ?? []}
        disableRowSelectionOnClick
        {...muiPagination}
      />
    </Stack>
  );
};
