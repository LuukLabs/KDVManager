import { useTranslation } from "react-i18next";
import { Alert } from "@mui/material";
import type { TrialStatus } from "@api/trial/trial";

type TrialBannerProps = {
  trial: TrialStatus;
};

/**
 * Slim banner shown across the app while a tenant is on their 30-day trial,
 * counting down the days remaining. Switches to a warning tone in the final
 * week. Renders nothing once the trial has expired (the lock screen takes over)
 * or when the tenant has converted to a subscription.
 */
const TrialBanner: React.FC<TrialBannerProps> = ({ trial }) => {
  const { t } = useTranslation();

  if (trial.isExpired || trial.isSubscribed) return null;

  const severity = trial.daysRemaining <= 7 ? "warning" : "info";

  return (
    <Alert severity={severity} square sx={{ borderRadius: 0 }} role="status">
      {t("trial.daysLeft", { count: trial.daysRemaining })}
    </Alert>
  );
};

export default TrialBanner;
