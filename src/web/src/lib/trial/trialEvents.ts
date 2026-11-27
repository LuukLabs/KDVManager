/**
 * Window event dispatched when an API call is rejected because the tenant's
 * 30-day trial has expired (HTTP 402 with `code: "trial_expired"`). The trial
 * guard listens for this to refresh trial status and show the lock screen.
 */
export const TRIAL_EXPIRED_EVENT = "kdv:trial-expired";

export const dispatchTrialExpired = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(TRIAL_EXPIRED_EVENT));
  }
};
