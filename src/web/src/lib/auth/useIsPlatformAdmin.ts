import { useQuery } from "@tanstack/react-query";
import { getIsPlatformAdminFromToken } from "./auth";

/**
 * Whether the signed-in user is a platform admin (cross-tenant), per the admin
 * claim on the access token. Drives UI visibility only — every admin endpoint
 * is independently authorized server-side.
 */
export const useIsPlatformAdmin = (): boolean => {
  const { data } = useQuery({
    queryKey: ["platform-admin-claim"],
    queryFn: () => getIsPlatformAdminFromToken(),
    staleTime: 5 * 60 * 1000,
  });

  return data === true;
};
