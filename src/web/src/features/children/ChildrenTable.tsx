import { useMemo } from "react";
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
  const { apiParams, muiPagination } = useChildrenListState();
  const { data, isLoading, isFetching } = useListChildren(
    { ...apiParams },
    {
      query: { placeholderData: keepPreviousData },
    },
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "childNumber",
        headerName: "Child #",
        width: 100,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
      },
      {
        field: "fullName",
        headerName: "Fullname",
        flex: 1,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
      },
      {
        field: "dateOfBirth",
        headerName: "Birthdate",
        flex: 1,
        sortable: false,
        disableColumnMenu: true,
        disableReorder: true,
        valueFormatter: (value) => value && dayjs(value).format("DD/MM/YYYY"),
      },
      {
        field: "id",
        headerName: "Actions",
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
    [],
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
