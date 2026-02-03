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
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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

  if (isMobile) {
    if (isLoading && !data) {
      return (
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={150} sx={{ borderRadius: 1 }} />
          ))}
        </Stack>
      );
    }

    const paginationModel = muiPagination.paginationModel;
    const pageSize = paginationModel?.pageSize ?? 10;
    const totalPages = Math.ceil((data?.meta.total ?? 0) / pageSize);
    const currentPage = (paginationModel?.page ?? 0) + 1;

    return (
      <Stack spacing={2} sx={{ width: "100%" }}>
        {data?.value?.map((child) => {
          const statusConfig = getStatusConfig(
            child.schedulingStatus ?? ChildSchedulingStatus.NoPlanning,
            child.statusRelevantDate,
            t,
          );
          return (
            <Card key={child.id} variant="outlined">
              <CardContent sx={{ pb: 1 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={1}
                  spacing={1}
                >
                  <Typography variant="h6" component="div" sx={{ wordBreak: "break-word" }}>
                    {child.fullName}
                  </Typography>
                  <Chip
                    label={statusConfig.label}
                    color={statusConfig.color}
                    size="small"
                    variant="outlined"
                    sx={{ flexShrink: 0 }}
                  />
                </Stack>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  {t("table.header.childNumber")}: {child.childNumber}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {t("table.header.dateOfBirth")}:{" "}
                  {/* eslint-disable-next-line i18next/no-literal-string */}
                  {child.dateOfBirth ? dayjs(child.dateOfBirth).format("DD/MM/YYYY") : "-"}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                <EditChildButton id={child.id!} />
                <DeleteChildButton id={child.id!} displayName={child.fullName} />
              </CardActions>
            </Card>
          );
        })}

        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" py={2}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) =>
                muiPagination.onPaginationModelChange?.(
                  {
                    page: page - 1,
                    pageSize: pageSize,
                  },
                  { reason: undefined } as any,
                )
              }
              color="primary"
              size="small"
            />
          </Box>
        )}
      </Stack>
    );
  }

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
