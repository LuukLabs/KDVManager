import { createTheme } from "@mui/material/styles";
import { nlNL as coreNlNL } from "@mui/material/locale";
import { nlNL as dataGridNlNL } from "@mui/x-data-grid/locales";
import { nlNL as pickersNlNL } from "@mui/x-date-pickers/locales";
import type {} from "@mui/x-data-grid/themeAugmentation";

// KDVManager brand tokens — see src/marketing/brand.html (merkgids).
// The app adopts the identity layer (colors, type, soft shapes) but not the
// marketing "sticker" styling (ink borders, rotations, display serif).
const ink = "#1E2B23";
const inkSoft = "#44544A";
const pine = "#2E5E4E";
const pineDark = "#234A3D";
const leaf = "#6FA287";
const marigold = "#F2A93B";
// Softer than the marketing paper (#FBF6ED): calmer behind large data tables.
const paper = "#FAF7F0";

/* eslint-disable i18next/no-literal-string -- font stack, not user-facing copy */
const fontFamily = [
  '"Instrument Sans Variable"',
  '"Instrument Sans"',
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  "sans-serif",
].join(", ");
/* eslint-enable i18next/no-literal-string */

export const theme = createTheme({
  palette: {
    primary: {
      main: pine,
      dark: pineDark,
      light: leaf,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: marigold,
      contrastText: ink,
    },
    text: {
      primary: ink,
      secondary: inkSoft,
    },
    background: {
      default: paper,
      paper: "#FFFFFF",
    },
    divider: "#E7E0D2",
  },
  typography: {
    fontFamily,
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiTablePagination: {
      defaultProps: {
        // The core nlNL locale pack leaves this one untranslated
        labelDisplayedRows: ({ from, to, count }) =>
          `${from}–${to} van ${count !== -1 ? count : `meer dan ${to}`}`,
      },
    },
    MuiDataGrid: {
      defaultProps: {
        localeText: {
          // Untranslated (commented out) in the x-data-grid nlNL pack
          paginationDisplayedRows: ({ from, to, count, estimated }) => {
            if (count !== -1) return `${from}–${to} van ${count}`;
            return `${from}–${to} van meer dan ${estimated && estimated > to ? estimated : to}`;
          },
        },
      },
    },
  },
}, coreNlNL, dataGridNlNL, pickersNlNL);
