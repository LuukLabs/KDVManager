import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, useSearchParams } from "react-router-dom";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { sanitizeReturnTo } from "@lib/auth/auth";
import AuthPageLayout from "./AuthPageLayout";

// If the browser hasn't navigated to Auth0 after this long, stop spinning and
// offer a manual retry instead.
const REDIRECT_FALLBACK_DELAY_MS = 8_000;

const LoginPage = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [showFallback, setShowFallback] = useState(false);

  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));

  const startLogin = useCallback(() => {
    void loginWithRedirect({ appState: { returnTo } });
  }, [loginWithRedirect, returnTo]);

  const hasStartedLogin = useRef(false);
  useEffect(() => {
    if (isLoading || isAuthenticated || hasStartedLogin.current) return;
    hasStartedLogin.current = true;
    startLogin();
  }, [isLoading, isAuthenticated, startLogin]);

  useEffect(() => {
    const timer = setTimeout(() => setShowFallback(true), REDIRECT_FALLBACK_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={returnTo} replace />;
  }

  if (showFallback && !isLoading) {
    return (
      <AuthPageLayout>
        <Typography variant="h4" component="h1">
          {t("Login failed to start. Please try again.")}
        </Typography>
        <Button variant="contained" onClick={startLogin}>
          {t("Login")}
        </Button>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout>
      <Typography variant="h4" component="h1">
        {t("Redirecting to login...")}
      </Typography>
      <CircularProgress size={40} />
    </AuthPageLayout>
  );
};

export const Component = LoginPage;
