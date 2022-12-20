import React, { useCallback, useState } from "react";
import { ChildListVM } from "../../api/models";
import { useGetAllChildren } from "../../api/endpoints/children/children";
import { GridColDef } from "@mui/x-data-grid/models/colDef";
import { DataGrid } from "@mui/x-data-grid/DataGrid";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "fullName", headerName: "Fullname", flex: 1 },
];

const ChildrenTable = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const { data, isLoading, isFetching } = useGetAllChildren(
    {
      pageNumber: page,
      pageSize: pageSize,
    },
    { query: { keepPreviousData: true } }
  );

  const changePage = useCallback((newPage) => setPage(newPage + 1), []);

  const changePageSize = useCallback(
    (newPageSize) => setPageSize(newPageSize),
    []
  );

  return (
    <DataGrid<ChildListVM>
      autoHeight
      rowsPerPageOptions={[5, 10, 20]}
      paginationMode="server"
      pageSize={pageSize}
      rowCount={data?.meta?.total || 0}
      loading={isLoading || isFetching}
      columns={columns}
      rows={data?.value || []}
      onPageChange={changePage}
      onPageSizeChange={changePageSize}
    />
  );
};

export default ChildrenTable;
