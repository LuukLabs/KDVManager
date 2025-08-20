import React from "react";
import { Paper, Box } from "@mui/material";

/**
 * AccentSection
 * A lightweight surface with an accent left border and responsive padding.
 * Used to visually group information without heavy elevation.
 */
export const AccentSection: React.FC<React.PropsWithChildren<{ borderColor?: string }>> = ({
  children,
  borderColor = "primary.main",
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        borderLeftWidth: { xs: 4, md: 6 },
        borderLeftColor: borderColor,
        borderRadius: 3,
        p: { xs: 2, sm: 2.5, md: 3 },
        background: (theme) =>
          `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
      }}
    >
      <Box>{children}</Box>
    </Paper>
  );
};
