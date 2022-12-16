import React, { useCallback, useState } from "react";

import { ChildListVM } from "../../api/models";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { useGetAllChildren } from "../../api/endpoints/children/children";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "fullName", headerName: "Fullname", flex: 1 },
];

const ChildrenTable = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const { data, isLoading, isPreviousData } = useGetAllChildren(
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
      loading={isLoading || isPreviousData}
      columns={columns}
      rows={data?.value || []}
      onPageChange={changePage}
      onPageSizeChange={changePageSize}
    />
  );
};

export default ChildrenTable;
