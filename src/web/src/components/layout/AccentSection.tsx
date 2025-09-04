import React from "react";
import { Paper, Box, alpha, useTheme } from "@mui/material";

type AccentSectionProps = React.PropsWithChildren<{
  borderColor?: string;
  variant?: "subtle" | "outlined" | "elevated" | "tonal";
  padding?: "compact" | "normal" | "spacious";
  fullHeight?: boolean;
}>;

/**
 * AccentSection
 * Modern, flexible content container with multiple visual density variants.
 * Defaults to a subtle surface blending with the page background.
 */
export const AccentSection: React.FC<AccentSectionProps> = ({
  children,
  borderColor = "primary.main",
  variant = "subtle",
  padding = "normal",
  fullHeight = false,
}) => {
  const theme = useTheme();

  const paddingMap = {
    compact: { xs: 1.25, sm: 1.5, md: 1.75 },
    normal: { xs: 1.75, sm: 2, md: 2.5 },
    spacious: { xs: 2, sm: 2.5, md: 3.5 },
  } as const;

  const baseStyles = {
    borderRadius: 2.5,
    height: fullHeight ? "100%" : undefined,
    p: paddingMap[padding],
    transition: "background-color .25s ease, border-color .25s ease, box-shadow .25s ease",
  } as const;

  let variantStyles: any = {};
  switch (variant) {
    case "outlined":
      variantStyles = {
        border: 1,
        borderColor: "divider",
        backgroundColor: theme.palette.background.paper,
      };
      break;
    case "elevated":
      variantStyles = {
        boxShadow: theme.shadows[2],
        backgroundColor: theme.palette.background.paper,
      };
      break;
    case "tonal":
      variantStyles = {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        border: 1,
        borderColor: alpha(theme.palette.primary.main, 0.15),
      };
      break;
    case "subtle":
    default:
      variantStyles = {
        border: 1,
        borderColor: "divider",
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
      };
      break;
  }

  // Accent stripe (left) only for outlined & tonal variants to reduce noise
  const accentStyles = ["outlined", "tonal"].includes(variant)
    ? {
        borderLeftWidth: { xs: 3, md: 4 },
        borderLeftStyle: "solid",
        borderLeftColor: borderColor,
      }
    : {};

  return (
    <Paper
      elevation={variant === "elevated" ? 1 : 0}
      sx={{ ...baseStyles, ...variantStyles, ...accentStyles }}
    >
      <Box>{children}</Box>
    </Paper>
  );
};
