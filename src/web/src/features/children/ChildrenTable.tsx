import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { type GridColDef } from "@mui/x-data-grid/models";
import { type GridRenderCellParams } from "@mui/x-data-grid";
import { type ChildListVM } from "@api/crm/models/childListVM";
import {
  ChildSchedulingStatus,
  type ChildSchedulingStatus as ChildSchedulingStatusType,
} from "@api/crm/models/childSchedulingStatus";
import { keepPreviousData } from "@tanstack/react-query";
import { useListChildren } from "@api/crm/endpoints/children/children";
import { getTotal } from "@api/mutator/executeFetchPaginated";
import { useChildrenListState } from "@hooks/useListState";
import { formatDate } from "@utils/formatDate";
import { AppDataGrid } from "@components/datagrid/AppDataGrid";
import { staticColumn } from "@components/datagrid/staticColumn";
import { EntityLink } from "@components/navigation/EntityLink";
import { EntityCard } from "@components/cards/EntityCard";
import { MobileCardList } from "@components/cards/MobileCardList";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
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
          ? t("status.activeUntil", { date: formatDate(statusRelevantDate) })
          : t("status.active"),
        color: "success" as const,
      };
    case ChildSchedulingStatus.Upcoming:
      return {
        label: statusRelevantDate
          ? t("status.upcomingFrom", { date: formatDate(statusRelevantDate) })
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

const StatusChip = ({ child }: { child: ChildListVM }) => {
  const { t } = useTranslation();
  const config = getStatusConfig(
    child.schedulingStatus ?? ChildSchedulingStatus.NoPlanning,
    child.statusRelevantDate,
    t,
  );
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      variant="outlined"
      sx={{ flexShrink: 0 }}
    />
  );
};

export const ChildrenTable = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
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
      staticColumn({
        field: "childNumber",
        headerName: t("table.header.childNumber"),
        width: 100,
      }),
      staticColumn({
        field: "fullName",
        headerName: t("table.header.fullName"),
        flex: 1,
        renderCell: (params: GridRenderCellParams<ChildListVM, string>) =>
          params.row.id ? (
            <EntityLink to={`/children/${params.row.id}`}>{params.value}</EntityLink>
          ) : (
            params.value
          ),
      }),
      staticColumn({
        field: "dateOfBirth",
        headerName: t("table.header.dateOfBirth"),
        flex: 1,
        valueFormatter: (value) => value && formatDate(value),
      }),
      staticColumn({
        field: "schedulingStatus",
        headerName: t("table.header.status"),
        width: 200,
        renderCell: (params: GridRenderCellParams<ChildListVM, ChildSchedulingStatusType>) => (
          <StatusChip child={params.row} />
        ),
      }),
      staticColumn({
        field: "id",
        headerName: t("table.header.actions"),
        renderCell: (params: GridRenderCellParams<ChildListVM, string>) => (
          <>
            <DeleteChildButton id={params.value!} displayName={params.row.fullName} />
            <EditChildButton id={params.value!} />
          </>
        ),
      }),
    ],
    [t],
  );

  if (isMobile) {
    return (
      <MobileCardList<ChildListVM>
        items={data}
        isLoading={isLoading}
        total={getTotal(data)}
        getKey={(child) => child.id!}
        pagination={muiPagination}
        renderCard={(child) => (
          <EntityCard
            title={child.fullName ?? ""}
            badge={<StatusChip child={child} />}
            onClick={() => child.id && navigate(`/children/${child.id}`)}
            actions={
              <>
                <EditChildButton id={child.id!} />
                <DeleteChildButton id={child.id!} displayName={child.fullName} />
              </>
            }
          >
            <Typography variant="body2" gutterBottom sx={{ color: "text.secondary" }}>
              {t("table.header.childNumber")}: {child.childNumber}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {t("table.header.dateOfBirth")}:{" "}
              {child.dateOfBirth ? formatDate(child.dateOfBirth) : "-"}
            </Typography>
          </EntityCard>
        )}
      />
    );
  }

  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      <AppDataGrid<ChildListVM>
        rowCount={getTotal(data)}
        loading={isLoading || isFetching}
        columns={columns}
        rows={data ?? []}
        {...muiPagination}
      />
    </Stack>
  );
};
