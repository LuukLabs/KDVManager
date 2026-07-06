import { type PropsWithChildren } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

/** Centered full-height container shared by the login and callback screens. */
const AuthPageLayout = ({ children }: PropsWithChildren) => (
  <Container maxWidth="sm">
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        gap: 2,
      }}
    >
      {children}
    </Box>
  </Container>
);

export default AuthPageLayout;
