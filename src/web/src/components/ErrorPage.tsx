import { useTranslation } from "react-i18next";
import { useRouteError } from "react-router-dom";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ApiError } from "@api/errors/types";
import DevErrorPanel from "./DevErrorPanel";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";
import { useEffect, useState } from "react";

type ErrorPageProps = {
  errorOverride?: unknown;
};
export default function ErrorPage({ errorOverride }: ErrorPageProps) {
  const { t } = useTranslation();
  const routeError = useRouteError();
  const error = errorOverride ?? routeError;
  const navigate = useNavigate();
  console.error(error);

  const [traceId, setTraceId] = useState<string | undefined>();
  useEffect(() => {
    const getter = (window as any).getCurrentTraceId;
    if (typeof getter === "function") {
      setTraceId(getter());
    }
  }, []);

  let status: number | undefined;

  let message = t("error.unexpected");
  if (error instanceof ApiError) {
    status = error.status;
    switch (error.type) {
      case "unauthorized":
        message = t("error.unauthorized");
        break;
      case "forbidden":
        message = t("error.forbidden");
        break;
      case "not-found":
        message = t("error.notFound");
        break;
      case "server":
        message = t("error.server");
        break;
      case "network":
        message = t("error.network");
        break;
      default:
        message = t("error.unexpected");
    }
  }

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
        alt={t("KDVManager Logo")}
        sx={{
          maxWidth: { xs: "200px", sm: "250px", md: "300px" },
          height: "auto",
          opacity: 0.7,
        }}
      />
      <Box>
        <Typography variant="h3" component="h1" gutterBottom>
          {status ? `${status} – ${t("error.oops")}` : t("error.oops")}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {message}
        </Typography>
        {traceId && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            {t("error.traceId", "Trace ID")}: <code>{traceId}</code>
          </Typography>
        )}
        {process.env.NODE_ENV === "development" && error instanceof Error && (
          <DevErrorPanel error={error} />
        )}
      </Box>
      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
        >
          {t("Retry")}
        </Button>
        <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate("/")}>
          {t("Go to Home")}
        </Button>
      </Stack>
    </Box>
  );
}
