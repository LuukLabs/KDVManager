import { type PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, CircularProgress } from "@mui/material";
import { useMyTenant } from "@lib/tenant/useMyTenant";
import { getTenantIdFromToken } from "@lib/auth/auth";

/**
 * Gates the authenticated app on the user having a tenant. A user "has a tenant"
 * if their access token already carries the tenant claim OR the TenantManagement
 * API reports one. Only when both are absent do we send them to onboarding.
 *
 * Checking the claim first means established users (and environments where the
 * token is pre-seeded with the claim) never depend on a backend round-trip, and a
 * transient `/me` error fails open rather than trapping the user.
 */
const TenantGuard: React.FC<PropsWithChildren> = ({ children }) => {
  const claim = useQuery({
    queryKey: ["tenant-claim"],
    queryFn: () => getTenantIdFromToken(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: tenant, isLoading: tenantLoading, isError } = useMyTenant();

  if (claim.isLoading || tenantLoading) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const hasTenant = Boolean(claim.data) || Boolean(tenant);

  if (!hasTenant && !isError) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default TenantGuard;
