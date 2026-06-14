import { createTheme, type ThemeOptions } from "@mui/material/styles";

/**
 * KDVManager design system
 * ------------------------
 * A single, documented source of truth for the application's visual language.
 *
 * Why this file exists
 * - Maintainability: design decisions (colour, spacing, radius, typography,
 *   component defaults) live here instead of being copy/pasted as inline `sx`
 *   styles across components. Tweak a token here and it propagates everywhere.
 * - Accessibility (WCAG 2.1 AA): the palette is chosen so text/background
 *   pairings meet the 4.5:1 (normal text) / 3:1 (large text & UI) contrast
 *   minimums, focus is always visible, and motion respects user preferences.
 *
 * How to use it
 * - Prefer theme tokens over hardcoded values in components, e.g.
 *     sx={{ color: "primary.main", bgcolor: "background.paper", p: 2 }}
 *   rather than literal hex codes. This keeps contrast guarantees intact.
 */

/* -------------------------------------------------------------------------- */
/* Design tokens                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Brand and semantic colours. Every `main` colour below has been verified to
 * give >= 4.5:1 contrast with its `contrastText`, so component labels remain
 * legible (WCAG 1.4.3). `contrastThreshold` (set on the palette) keeps MUI's
 * automatic contrast-text selection on the accessible side of the line.
 */
export const palette = {
  // blue[800] — white text on this passes AA for normal text (~6.3:1),
  // unlike the default blue[700] (#1976d2 ~4.6:1) which only just scrapes by.
  primary: {
    main: "#1565c0",
    light: "#5e92f3",
    dark: "#003c8f",
    contrastText: "#ffffff",
  },
  // A warm, accessible accent used for secondary actions / progress.
  secondary: {
    main: "#9c27b0",
    light: "#d05ce3",
    dark: "#6a0080",
    contrastText: "#ffffff",
  },
  error: { main: "#c62828", contrastText: "#ffffff" },
  warning: { main: "#a85b00", contrastText: "#ffffff" },
  info: { main: "#0277bd", contrastText: "#ffffff" },
  success: { main: "#2e7d32", contrastText: "#ffffff" },
  background: {
    default: "#f4f6f8",
    paper: "#ffffff",
  },
  text: {
    // 0.6 alpha (the MUI default) only reaches ~4.5:1 and dips below it on the
    // tinted page background. 0.7 keeps secondary text comfortably AA.
    primary: "rgba(0, 0, 0, 0.87)",
    secondary: "rgba(0, 0, 0, 0.70)",
    disabled: "rgba(0, 0, 0, 0.45)",
  },
  divider: "rgba(0, 0, 0, 0.12)",
};

/** Colour of the keyboard focus ring (WCAG 2.4.7). */
export const focusRing = palette.primary.light;

/** Minimum interactive target size in px (WCAG 2.5.5 / 2.5.8). */
export const minTouchTarget = 44;

/* -------------------------------------------------------------------------- */
/* Theme                                                                      */
/* -------------------------------------------------------------------------- */

const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    // Bias MUI's getContrastText towards meeting the 4.5:1 AA ratio when it
    // auto-picks black vs white text for a given background.
    contrastThreshold: 4.5,
    ...palette,
  },

  shape: {
    // Keep the MUI default (4px) so existing `sx={{ borderRadius: n }}`
    // multipliers in components render as before.
    borderRadius: 4,
  },

  typography: {
    // System font stack mirrors index.css so there is no flash of fallback font.
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: { fontWeight: 700, fontSize: "2.25rem", lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: "1.875rem", lineHeight: 1.25 },
    h3: { fontWeight: 600, fontSize: "1.5rem", lineHeight: 1.3 },
    h4: { fontWeight: 600, fontSize: "1.25rem", lineHeight: 1.35 },
    h5: { fontWeight: 600, fontSize: "1.125rem", lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: "1rem", lineHeight: 1.5 },
    button: {
      // Sentence case is easier to read than ALL-CAPS (WCAG 1.4.8 / 3.1.5).
      textTransform: "none",
      fontWeight: 600,
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.default,
        },

        // WCAG 2.4.7 (Focus Visible): a consistent, high-contrast focus ring
        // for every keyboard-focusable element. `:focus-visible` keeps it from
        // showing on mouse clicks.
        "*:focus-visible": {
          outline: `3px solid ${focusRing}`,
          outlineOffset: "2px",
        },

        // WCAG 2.3.3 (Animation from Interactions): honour the OS "reduce
        // motion" setting by collapsing transitions/animations.
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": {
            animationDuration: "0.01ms !important",
            animationIterationCount: "1 !important",
            transitionDuration: "0.01ms !important",
            scrollBehavior: "auto !important",
          },
        },

        // WCAG 2.4.1 (Bypass Blocks): a "skip to main content" link that is
        // visually hidden until focused, letting keyboard users jump past the
        // navigation. Used by MainNavbar.
        ".skip-link": {
          position: "absolute",
          left: "-9999px",
          top: 0,
          zIndex: 2000,
          padding: "8px 16px",
          backgroundColor: palette.primary.main,
          color: palette.primary.contrastText,
          borderRadius: "0 0 4px 0",
          textDecoration: "none",
          fontWeight: 600,
        },
        ".skip-link:focus, .skip-link:focus-visible": {
          left: 0,
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8 },
        // Guarantee an accessible target height for the common button sizes.
        sizeSmall: { minHeight: 36 },
        sizeMedium: { minHeight: 40 },
        sizeLarge: { minHeight: minTouchTarget },
      },
    },

    MuiLink: {
      defaultProps: { underline: "hover" },
    },

    MuiTooltip: {
      defaultProps: { arrow: true },
    },

    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 8 } },
    },

    MuiAppBar: {
      defaultProps: { color: "primary" },
    },
  },
};

export const theme = createTheme(themeOptions);

export default theme;
