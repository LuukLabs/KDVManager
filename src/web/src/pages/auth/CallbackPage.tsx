import { useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { consumePostLoginReturnTo, loginPath, sanitizeReturnTo } from "@lib/auth/auth";
import AuthPageLayout from "./AuthPageLayout";

/**
 * Landing page for the Auth0 redirect (redirect_uri). The Auth0Provider
 * exchanges the authorization code during SDK initialisation; once that
 * settles, this page forwards the user to the destination captured in the
 * login appState (handed off via consumePostLoginReturnTo).
 */
const CallbackPage = () => {
  const { isLoading, error, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const hasNavigated = useRef(false);
  useEffect(() => {
    if (isLoading || error || hasNavigated.current) return;
    hasNavigated.current = true;

    if (isAuthenticated) {
      navigate(sanitizeReturnTo(consumePostLoginReturnTo()), { replace: true });
    } else {
      navigate(loginPath(), { replace: true });
    }
  }, [isLoading, error, isAuthenticated, navigate]);

  if (error) {
    return (
      <AuthPageLayout>
        <Typography variant="h4" component="h1">
          {t("Login failed")}
        </Typography>
        <Typography color="text.secondary">{error.message}</Typography>
        <Button variant="contained" onClick={() => navigate(loginPath(), { replace: true })}>
          {t("Try again")}
        </Button>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout>
      <Typography variant="h4" component="h1">
        {t("Completing authentication...")}
      </Typography>
      <CircularProgress size={40} />
    </AuthPageLayout>
  );
};

export const Component = CallbackPage;
