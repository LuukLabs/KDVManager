import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrialStatus, trialStatusQueryKey, type TrialStatus } from "@api/trial/trial";
import { TRIAL_EXPIRED_EVENT } from "./trialEvents";

/**
 * Fetches the current tenant's trial status. Also listens for the global
 * "trial expired" event (dispatched when any API call returns HTTP 402) and
 * refetches so the lock screen appears promptly regardless of which request
 * tripped the limit.
 */
export const useTrialStatus = () => {
  const queryClient = useQueryClient();

  const query = useQuery<TrialStatus>({
    queryKey: trialStatusQueryKey,
    queryFn: ({ signal }) => getTrialStatus({ signal }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const handler = () => {
      void queryClient.invalidateQueries({ queryKey: trialStatusQueryKey });
    };
    window.addEventListener(TRIAL_EXPIRED_EVENT, handler);
    return () => window.removeEventListener(TRIAL_EXPIRED_EVENT, handler);
  }, [queryClient]);

  return query;
};
