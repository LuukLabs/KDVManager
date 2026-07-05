import { type ReactNode } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

type FormSectionProps = {
  title?: string;
  /** Grid items (`<Grid size={...}>`) laid out in the section's field grid. */
  children: ReactNode;
};

/** Card section grouping related form fields under an optional title. */
export const FormSection = ({ title, children }: FormSectionProps) => (
  <Card>
    <CardContent>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <Grid container spacing={2}>
        {children}
      </Grid>
    </CardContent>
  </Card>
);
