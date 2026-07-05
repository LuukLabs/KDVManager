import { type ReactNode } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

type FormPageLayoutProps = {
  title: string;
  children: ReactNode;
};

/** Page shell for full-page create/edit forms: centered column with a heading. */
export const FormPageLayout = ({ title, children }: FormPageLayoutProps) => (
  <Container maxWidth="md" disableGutters>
    <Typography variant="h4" component="h1" gutterBottom>
      {title}
    </Typography>
    {children}
  </Container>
);
