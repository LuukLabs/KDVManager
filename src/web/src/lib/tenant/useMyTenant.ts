import { useQuery } from "@tanstack/react-query";
import { getMyTenant, myTenantQueryKey, type MyTenant } from "@api/tenant/tenant";

/**
 * Fetches the current user's tenant. Resolves to `null` when the user has no
 * tenant yet (onboarding required). Errors are left to the caller so transient
 * failures don't trap the user on the onboarding screen.
 */
export const useMyTenant = () =>
  useQuery<MyTenant | null>({
    queryKey: myTenantQueryKey,
    queryFn: ({ signal }) => getMyTenant({ signal }),
    staleTime: 5 * 60 * 1000,
  });
