import { DataGrid, type DataGridProps, type GridValidRowModel } from "@mui/x-data-grid";

/**
 * DataGrid with the app-wide defaults so every table looks and behaves the
 * same. Any prop can still be overridden per table.
 */
export const AppDataGrid = <R extends GridValidRowModel>(props: DataGridProps<R>) => (
  <DataGrid<R> autoHeight pageSizeOptions={[5, 10, 20]} disableRowSelectionOnClick {...props} />
);
