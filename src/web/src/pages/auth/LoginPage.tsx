import { useEffect, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Container } from "@mui/material";
import { useTranslation } from "react-i18next";

const LoginPage = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [timeoutError, setTimeoutError] = useState(false);
  const { t } = useTranslation();

  console.log("isLoading", isLoading);
  console.log("isAuthenticated", isAuthenticated);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const returnTo = searchParams.get("returnTo") ?? "/schedule";
      console.log("Navigating", returnTo);
      navigate(returnTo);
    }
  }, [isAuthenticated, isLoading, navigate, searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isAuthenticated && !isLoading) {
        setTimeoutError(true);
      }
    }, 10000); // 10 seconds
    return () => clearTimeout(timeout);
  }, [isAuthenticated, isLoading]);

  const hasRedirected = useRef(false);
  useEffect(() => {
    console.log("LoginPage state:", {
      isLoading,
      isAuthenticated,
      hasRedirected: hasRedirected.current,
    });
    if (!isLoading && !isAuthenticated && !hasRedirected.current) {
      const returnTo = searchParams.get("returnTo") ?? "/schedule";
      console.log("Login returnTo", returnTo);
      hasRedirected.current = true;
      loginWithRedirect({
        appState: { returnTo },
      });
    }
  }, [loginWithRedirect, isLoading, isAuthenticated, searchParams]);

  if (timeoutError) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            {t("Login failed to start. Please try again.")}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {t("Redirecting to login...")}
        </Typography>
        <CircularProgress size={40} sx={{ mt: 2 }} />
      </Box>
    </Container>
  );
};

export const Component = LoginPage;
