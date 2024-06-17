import { useCallback, useMemo, useState } from "react";
import { type DataGridProps, type GridPaginationModel } from "@mui/x-data-grid";

type Pagination = {
  pageNumber: number;
  pageSize: number;
};

export const usePagination = () => {
  const [pagination, setPagination] = useState<Pagination>({
    pageNumber: 1,
    pageSize: 10,
  });

  const apiPagination = useMemo(
    () => ({
      PageNumber: pagination.pageNumber,
      PageSize: pagination.pageSize,
    }),
    [pagination],
  );

  const onPaginationModelChange = useCallback(
    (model: GridPaginationModel) => {
      setPagination({ pageNumber: model.page + 1, pageSize: model.pageSize });
    },
    [setPagination],
  );

  const muiPagination = useMemo(
    (): Pick<DataGridProps, "paginationMode" | "onPaginationModelChange" | "paginationModel"> => ({
      paginationMode: "server",
      onPaginationModelChange: onPaginationModelChange,
      paginationModel: {
        page: pagination.pageNumber - 1,
        pageSize: pagination.pageSize,
      },
    }),
    [pagination],
  );

  return { apiPagination, muiPagination };
};
