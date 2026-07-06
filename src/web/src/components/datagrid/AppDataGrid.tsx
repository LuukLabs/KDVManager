import { DataGrid, type DataGridProps, type GridValidRowModel } from "@mui/x-data-grid";
import { QueryErrorAlert } from "@components/errors/QueryErrorAlert";

type AppDataGridProps<R extends GridValidRowModel> = DataGridProps<R> & {
  /** Query error, if any. When set, an error alert replaces the grid instead of an empty table. */
  error?: unknown;
  /** Called when the user clicks "Retry" in the error alert, e.g. the query's refetch. */
  onRetry?: () => void;
};

/**
 * DataGrid with the app-wide defaults so every table looks and behaves the
 * same. Any prop can still be overridden per table.
 */
export const AppDataGrid = <R extends GridValidRowModel>({
  error,
  onRetry,
  ...props
}: AppDataGridProps<R>) => {
  if (error) {
    return <QueryErrorAlert error={error} onRetry={onRetry} />;
  }

  return (
    <DataGrid<R> autoHeight pageSizeOptions={[5, 10, 20]} disableRowSelectionOnClick {...props} />
  );
};
