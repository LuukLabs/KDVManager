import { useCallback, useState } from "react";
import { GroupListVM } from "../../api/models";
import { GridColDef } from "@mui/x-data-grid/models/colDef";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import { useListGroups } from "../../api/endpoints/groups/groups";

const columns: GridColDef[] = [{ field: "name", headerName: "Groep", flex: 1 }];

const GroupsTable = () => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const { data, isLoading, isFetching } = useListGroups(
    {
      pageNumber: page,
      pageSize: pageSize,
    },
    { query: { keepPreviousData: true } }
  );

  const changePage = useCallback((newPage: number) => setPage(newPage + 1), []);

  const changePageSize = useCallback(
    (newPageSize: number) => setPageSize(newPageSize),
    []
  );

  return (
    <DataGrid<GroupListVM>
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

export default GroupsTable;
