// File: src/components/CallbackPage.tsx
import { useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Container } from "@mui/material";

const CallbackPage = () => {
  const { isLoading, error, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  // Retrieve appState from localStorage (set by AuthProviderWithNavigate)
  const getAppState = () => {
    const raw = localStorage.getItem("auth_app_state");
    if (!raw) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  };
  const appState = getAppState();

  console.log("Callback AppState", appState);

  useEffect(() => {
    if (error) {
      console.error("Auth callback error:", error);
    }
  }, [error]);

  const hasNavigated = useRef(false);
  useEffect(() => {
    if (hasNavigated.current) return;
    console.log("isLoading:", isLoading, "isAuthenticated:", isAuthenticated);
    if (!isLoading && isAuthenticated && appState) {
      const returnTo = appState.returnTo ?? "/schedule";
      console.log("Callback navigating", returnTo);
      hasNavigated.current = true;
      localStorage.removeItem("auth_app_state");
      navigate(returnTo);
    } else if (!isLoading && !error && !isAuthenticated) {
      hasNavigated.current = true;
      navigate("/auth/login");
    }
  }, [isAuthenticated, isLoading, error, appState, navigate]);

  if (error) {
    return null;
  }

  if (isLoading) {
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
            Completing authentication...
          </Typography>
          <CircularProgress size={40} sx={{ mt: 2 }} />
        </Box>
      </Container>
    );
  }

  // Prevent rendering anything after navigation
  return null;
};

export const Component = CallbackPage;
