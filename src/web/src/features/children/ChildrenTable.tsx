import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type GridColDef } from "@mui/x-data-grid/models";
import { DataGrid, type GridRenderCellParams } from "@mui/x-data-grid";
import { type ChildListVM } from "@api/models/childListVM";
import { keepPreviousData } from "@tanstack/react-query";
import { useListChildren } from "@api/endpoints/children/children";
import { useChildrenListState } from "@hooks/useChildrenListState";
import Stack from "@mui/material/Stack";
import dayjs from "dayjs";
import { DeleteChildButton } from "./DeleteChildButton";
import { EditChildButton } from "./EditChildButton";

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
        loading={isLoading ?? isFetching}
        columns={columns}
        rows={data?.value ?? []}
        disableRowSelectionOnClick
        {...muiPagination}
      />
    </Stack>
  );
};
