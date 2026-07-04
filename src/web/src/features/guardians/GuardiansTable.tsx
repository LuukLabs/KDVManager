import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { type GridColDef } from "@mui/x-data-grid/models";
import { type GridRenderCellParams } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import { useGuardiansListState } from "@hooks/useListState";
import { useListGuardians } from "@api/crm/endpoints/guardians/guardians";
import { getTotal } from "@api/mutator/executeFetchPaginated";
import { type GuardianListVM } from "@api/crm/models/guardianListVM";
import { AppDataGrid } from "@components/datagrid/AppDataGrid";
import { staticColumn } from "@components/datagrid/staticColumn";
import { EntityLink } from "@components/navigation/EntityLink";
import { EntityCard } from "@components/cards/EntityCard";
import { MobileCardList } from "@components/cards/MobileCardList";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DeleteGuardianButton } from "./DeleteGuardianButton";
import { ViewGuardianButton } from "./ViewGuardianButton";

export const GuardiansTable = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { apiParams, muiPagination } = useGuardiansListState();
  const { data, isLoading, isFetching } = useListGuardians(apiParams, {
    query: { placeholderData: keepPreviousData },
  });

  const columns: GridColDef<GuardianListVM>[] = useMemo(
    () => [
      staticColumn({
        field: "fullName",
        headerName: t("table.header.fullName"),
        flex: 2,
        renderCell: (params: GridRenderCellParams<GuardianListVM, string>) =>
          params.row.id ? (
            <EntityLink to={`/guardians/${params.row.id}`}>{params.value}</EntityLink>
          ) : (
            params.value
          ),
      }),
      staticColumn({
        field: "email",
        headerName: t("table.header.email"),
        flex: 2,
      }),
      staticColumn({
        field: "primaryPhoneNumber",
        headerName: t("table.header.phone"),
        flex: 1,
      }),
      staticColumn({
        field: "childrenCount",
        headerName: t("table.header.children"),
        width: 100,
        type: "number",
      }),
      staticColumn({
        field: "id",
        headerName: t("table.header.actions"),
        renderCell: (params: GridRenderCellParams<GuardianListVM, string>) => (
          <>
            <DeleteGuardianButton id={params.value!} displayName={params.row.fullName} />
            <ViewGuardianButton id={params.value!} />
          </>
        ),
      }),
    ],
    [t],
  );

  if (isMobile) {
    return (
      <MobileCardList<GuardianListVM>
        items={data}
        isLoading={isLoading}
        total={getTotal(data)}
        getKey={(guardian) => guardian.id!}
        pagination={muiPagination}
        renderCard={(guardian) => (
          <EntityCard
            title={guardian.fullName ?? ""}
            onClick={() => guardian.id && navigate(`/guardians/${guardian.id}`)}
            actions={
              <>
                <ViewGuardianButton id={guardian.id!} />
                <DeleteGuardianButton id={guardian.id!} displayName={guardian.fullName} />
              </>
            }
          >
            <Typography variant="body2" gutterBottom sx={{ color: "text.secondary" }}>
              {t("table.header.email")}: {guardian.email}
            </Typography>
            <Typography variant="body2" gutterBottom sx={{ color: "text.secondary" }}>
              {t("table.header.phone")}: {guardian.primaryPhoneNumber}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {t("table.header.children")}: {guardian.childrenCount}
            </Typography>
          </EntityCard>
        )}
      />
    );
  }

  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      <AppDataGrid<GuardianListVM>
        rowCount={getTotal(data)}
        loading={isLoading || isFetching}
        columns={columns}
        rows={data ?? []}
        {...muiPagination}
      />
    </Stack>
  );
};
