import { type ReactNode } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import { SectionHeader } from "@components/layout/SectionHeader";

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
        <SectionHeader title={title} description={description} icon={icon} />
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
