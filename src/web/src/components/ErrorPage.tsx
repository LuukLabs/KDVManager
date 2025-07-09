import { useTranslation } from "react-i18next";
import { useRouteError } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();
  const navigate = useNavigate();
  console.error(error);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        p: 3,
        gap: 3,
      }}
    >
      <Box
        component="img"
        src="/logo_transparent.png"
        alt="KDVManager Logo"
        sx={{
          maxWidth: { xs: "200px", sm: "250px", md: "300px" },
          height: "auto",
          opacity: 0.7,
        }}
      />
      <Box>
        <Typography variant="h3" component="h1" gutterBottom>
          {t("error.oops")}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {t("error.unexpected")}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          {t("error.notFound")}
        </Typography>
      </Box>
      <Button
        variant="contained"
        onClick={() => navigate("/")}
        sx={{ mt: 2 }}
      >
        {t("Go to Home")}
      </Button>
    </Box>
  );
}
