import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import {
  adminTenantsQueryKey,
  extendTenantTrial,
  listAdminTenants,
  type AdminTenant,
} from "@api/admin/adminTenants";

const EXTEND_DAYS = 30;

/**
 * Platform-admin overview of all tenants and their trials. Reachable only with
 * the admin claim (route loader + backend policy); regular users never see it.
 */
export function Component() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const tenants = useQuery({
    queryKey: adminTenantsQueryKey,
    queryFn: () => listAdminTenants(),
  });

  const extend = useMutation({
    mutationFn: (tenantId: string) => extendTenantTrial(tenantId, EXTEND_DAYS),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminTenantsQueryKey });
    },
  });

  const formatDate = (value: string) => dayjs(value).locale(i18n.language).format("MMMM D, YYYY");

  if (tenants.isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography variant="h5" component="h1">
          {t("Platform administration")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("All tenants on the platform and their trial status.")}
        </Typography>
      </Box>

      {tenants.isError ? (
        <Alert severity="error">{t("Failed to load tenants.")}</Alert>
      ) : null}

      {extend.isError ? (
        <Alert severity="error">{t("Extending the trial failed. Please try again.")}</Alert>
      ) : null}

      {tenants.data ? (
        <TableContainer component={Paper}>
          <Table size="small" aria-label={t("Tenants")}>
            <TableHead>
              <TableRow>
                <TableCell>{t("Organization")}</TableCell>
                <TableCell>{t("Created")}</TableCell>
                <TableCell>{t("Trial ends")}</TableCell>
                <TableCell>{t("table.header.status")}</TableCell>
                <TableCell align="right">{t("table.header.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.data.map((tenant: AdminTenant) => (
                <TableRow key={tenant.id} hover>
                  <TableCell>
                    <Typography variant="body2">{tenant.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tenant.id}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(tenant.createdAt)}</TableCell>
                  <TableCell>{formatDate(tenant.trialEndDate)}</TableCell>
                  <TableCell>
                    {tenant.isExpired ? (
                      <Chip size="small" color="error" label={t("Expired")} />
                    ) : (
                      <Chip
                        size="small"
                        color={tenant.daysRemaining <= 7 ? "warning" : "success"}
                        label={t("trial.adminDaysLeft", { count: tenant.daysRemaining })}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<MoreTimeIcon />}
                      disabled={extend.isPending}
                      onClick={() => extend.mutate(tenant.id)}
                    >
                      {t("Extend {{days}} days", { days: EXTEND_DAYS })}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {tenants.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {t("No tenants yet.")}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
    </Box>
  );
}
