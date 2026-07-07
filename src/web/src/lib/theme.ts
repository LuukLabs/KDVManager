import { createTheme, alpha } from "@mui/material/styles";

// Warm, calm palette suited to a childcare back-office: teal primary,
// terracotta secondary, soft warm-grey canvas. All main colors meet the
// WCAG AA 4.5:1 contrast ratio against their contrastText.
const teal = {
  main: "#0F766E",
  light: "#5EAFA8",
  dark: "#0B5750",
  contrastText: "#FFFFFF",
};

const terracotta = {
  main: "#B4502E",
  light: "#D98B6F",
  dark: "#8C3D22",
  contrastText: "#FFFFFF",
};

// Fixed set of distinct hues for hashing an entity (group, child, ...) to a
// stable color, e.g. group chips in the weekly schedule grid. Kept in the
// theme so every place that needs a categorical palette shares one list
// instead of hand-rolling its own array of hex strings.
const categoricalColors = [
  "#1976D2", // Blue
  "#388E3C", // Green
  "#F57C00", // Orange
  "#7B1FA2", // Purple
  "#C2185B", // Pink
  "#00796B", // Teal
  "#5D4037", // Brown
  "#455A64", // Blue Grey
];

// MUI's theme augmentation pattern requires `interface` — declaration
// merging (unlike `type`) is how these fields get added to Theme/ThemeOptions.
/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare module "@mui/material/styles" {
  interface Theme {
    customColors: {
      categorical: string[];
      /** Fallback for an entity with no assigned category (e.g. no group). */
      unassigned: string;
    };
  }
  interface ThemeOptions {
    customColors?: {
      categorical?: string[];
      unassigned?: string;
    };
  }
}
/* eslint-enable @typescript-eslint/consistent-type-definitions */

export const theme = createTheme({
  customColors: {
    categorical: categoricalColors,
    unassigned: "#757575",
  },
  palette: {
    contrastThreshold: 4.5,
    primary: teal,
    secondary: terracotta,
    success: { main: "#2E7D32" },
    warning: { main: "#B26A00" },
    error: { main: "#C62828" },
    info: { main: "#0E7490" },
    background: {
      default: "#F5F3F0",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#26333B",
      secondary: "#5B6B74",
    },
    divider: "rgba(38, 51, 59, 0.12)",
  },
  shape: {
    // Keep the default scale (sx `borderRadius: n` multiplies this value);
    // larger radii are applied per component below.
    borderRadius: 4,
  },
  typography: {
    fontFamily:
      "'Nunito Sans Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700, lineHeight: 1.25 },
    h6: { fontWeight: 600, lineHeight: 1.3 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F5F3F0",
        },
        // Visible focus for non-MUI focusables (links, native inputs);
        // MUI components keep their own focus-visible handling.
        "a:focus-visible, [tabindex]:focus-visible": {
          outline: `2px solid ${teal.main}`,
          outlineOffset: 2,
          borderRadius: 4,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiLink: {
      defaultProps: {
        underline: "hover",
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(teal.main, 0.12),
          color: teal.dark,
        },
      },
    },
  },
});
