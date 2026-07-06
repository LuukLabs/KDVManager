import { Fragment, type ReactNode } from "react";
import { type DataGridProps, type GridCallbackDetails } from "@mui/x-data-grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import Skeleton from "@mui/material/Skeleton";
import { QueryErrorAlert } from "@components/errors/QueryErrorAlert";

type MobileCardListProps<T> = {
  items: T[] | undefined;
  isLoading: boolean;
  /** Query error, if any. When set, an error alert replaces the list instead of an empty state. */
  error?: unknown;
  /** Called when the user clicks "Retry" in the error alert, e.g. the query's refetch. */
  onRetry?: () => void;
  /** Total number of records across all pages. */
  total: number;
  getKey: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  /** The same server pagination props the desktop DataGrid receives. */
  pagination: Pick<DataGridProps, "paginationModel" | "onPaginationModelChange">;
};

/**
 * Mobile counterpart of a paginated table: a stack of cards with the same
 * server-side pagination state as the desktop DataGrid, so switching between
 * breakpoints keeps the current page.
 */
export const MobileCardList = <T,>({
  items,
  isLoading,
  error,
  onRetry,
  total,
  getKey,
  renderCard,
  pagination,
}: MobileCardListProps<T>) => {
  if (error) {
    return <QueryErrorAlert error={error} onRetry={onRetry} />;
  }

  if (isLoading && !items) {
    return (
      <Stack spacing={2}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={150} sx={{ borderRadius: 1 }} />
        ))}
      </Stack>
    );
  }

  const pageSize = pagination.paginationModel?.pageSize ?? 10;
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = (pagination.paginationModel?.page ?? 0) + 1;

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {items?.map((item) => (
        <Fragment key={getKey(item)}>{renderCard(item)}</Fragment>
      ))}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) =>
              pagination.onPaginationModelChange?.(
                { page: page - 1, pageSize },
                // The change is user-initiated, so no grid API details apply.
                {} as GridCallbackDetails<"pagination">,
              )
            }
            color="primary"
            size="small"
          />
        </Box>
      )}
    </Stack>
  );
};
