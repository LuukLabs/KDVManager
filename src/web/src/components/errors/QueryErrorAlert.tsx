import { Alert, type AlertProps, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ApiError } from "@api/errors/types";

type QueryErrorAlertProps = {
  error: unknown;
  onRetry?: () => void;
  sx?: AlertProps["sx"];
};

/**
 * Shared error state for query-backed lists/tables. ApiError messages are
 * already localized by buildApiError, so we can render them directly.
 */
export const QueryErrorAlert = ({ error, onRetry, sx }: QueryErrorAlertProps) => {
  const { t } = useTranslation();
  const message = error instanceof ApiError ? error.message : t("error.unexpected");

  return (
    <Alert
      severity="error"
      sx={sx}
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            {t("Retry")}
          </Button>
        ) : undefined
      }
    >
      {message}
    </Alert>
  );
};
