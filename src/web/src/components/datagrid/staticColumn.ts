import { type GridColDef, type GridValidRowModel } from "@mui/x-data-grid";

/**
 * Column definition for the app's read-only tables: sorting, the column menu
 * and reordering are off by default so every table behaves the same.
 */
export const staticColumn = <R extends GridValidRowModel>(
  column: GridColDef<R>,
): GridColDef<R> => ({
  sortable: false,
  disableColumnMenu: true,
  disableReorder: true,
  ...column,
});
