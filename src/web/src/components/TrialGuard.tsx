import { type PropsWithChildren } from "react";
import { useTrialStatus } from "@lib/trial/useTrialStatus";
import TrialBanner from "./TrialBanner";
import TrialExpiredScreen from "./TrialExpiredScreen";

/**
 * Gates the authenticated app on the tenant's 30-day trial. When the trial has
 * expired it replaces the entire app with the lock screen; otherwise it shows a
 * countdown banner above the app. While the status is still loading (or if the
 * status request fails) it renders the app as-is — the backend remains the
 * authoritative gate via HTTP 402.
 */
const TrialGuard: React.FC<PropsWithChildren> = ({ children }) => {
  const { data: trial } = useTrialStatus();

  // isSubscribed is a belt-and-braces check: the backend already reports a
  // subscribed tenant as never expired.
  if (trial?.isExpired && !trial.isSubscribed) {
    return <TrialExpiredScreen />;
  }

  return (
    <>
      {trial ? <TrialBanner trial={trial} /> : null}
      {children}
    </>
  );
};

export default TrialGuard;
