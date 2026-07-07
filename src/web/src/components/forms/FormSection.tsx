import { type ReactNode } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";

export type FormSectionProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  /** Grid items (`<Grid size={...}>`) laid out in the section's field grid. */
  children: ReactNode;
};

/**
 * Card-style grouping for a set of related form fields, with an optional
 * icon, title and description. Keeps create/edit pages visually aligned.
 */
export const FormSection = ({ title, description, icon, children }: FormSectionProps) => (
  <Paper
    variant="outlined"
    sx={(theme) => ({
      borderRadius: 3,
      overflow: "hidden",
      backgroundColor: alpha(theme.palette.background.paper, 0.9),
    })}
  >
    {title && (
      <>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: { xs: 2, sm: 3 }, py: 2 }}>
          {icon && (
            <Avatar
              sx={(theme) => ({
                width: 40,
                height: 40,
                color: "primary.main",
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              })}
            >
              {icon}
            </Avatar>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {description}
              </Typography>
            )}
          </Box>
        </Box>
        <Divider />
      </>
    )}
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Grid container spacing={2}>
        {children}
      </Grid>
    </Box>
  </Paper>
);
