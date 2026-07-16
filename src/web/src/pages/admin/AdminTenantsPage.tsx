import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import UndoIcon from "@mui/icons-material/Undo";
import {
  adminTenantsQueryKey,
  deleteTenant,
  extendTenantTrial,
  listAdminTenants,
  setTenantSubscription,
  updateTenant,
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

  const [editing, setEditing] = useState<AdminTenant | null>(null);
  const [editName, setEditName] = useState("");
  const [editInvoiceAddress, setEditInvoiceAddress] = useState("");
  const [deleting, setDeleting] = useState<AdminTenant | null>(null);

  const tenants = useQuery({
    queryKey: adminTenantsQueryKey,
    queryFn: () => listAdminTenants(),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: adminTenantsQueryKey });
  };

  const extend = useMutation({
    mutationFn: (tenantId: string) => extendTenantTrial(tenantId, EXTEND_DAYS),
    onSuccess: invalidate,
  });

  const subscription = useMutation({
    mutationFn: ({ tenantId, subscribed }: { tenantId: string; subscribed: boolean }) =>
      setTenantSubscription(tenantId, subscribed),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({
      tenantId,
      name,
      invoiceAddress,
    }: {
      tenantId: string;
      name: string;
      invoiceAddress: string | null;
    }) => updateTenant(tenantId, { name, invoiceAddress }),
    onSuccess: async () => {
      await invalidate();
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: (tenantId: string) => deleteTenant(tenantId),
    onSuccess: async () => {
      await invalidate();
      setDeleting(null);
    },
  });

  const mutating =
    extend.isPending || subscription.isPending || update.isPending || remove.isPending;

  const formatDate = (value: string) => dayjs(value).locale(i18n.language).format("MMMM D, YYYY");

  const startEdit = (tenant: AdminTenant) => {
    setEditing(tenant);
    setEditName(tenant.name);
    setEditInvoiceAddress(tenant.invoiceAddress ?? "");
    update.reset();
  };

  const submitEdit = () => {
    if (!editing || editName.trim().length === 0) {
      return;
    }
    update.mutate({
      tenantId: editing.id,
      name: editName.trim(),
      invoiceAddress: editInvoiceAddress.trim() === "" ? null : editInvoiceAddress.trim(),
    });
  };

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

      {subscription.isError ? (
        <Alert severity="error">{t("Changing the subscription failed. Please try again.")}</Alert>
      ) : null}

      {remove.isError ? (
        <Alert severity="error">{t("Deleting the tenant failed. Please try again.")}</Alert>
      ) : null}

      {tenants.data ? (
        <TableContainer component={Paper}>
          <Table size="small" aria-label={t("Tenants")}>
            <TableHead>
              <TableRow>
                <TableCell>{t("Organization")}</TableCell>
                <TableCell>{t("Invoice address")}</TableCell>
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
                  <TableCell>
                    {tenant.invoiceAddress ? (
                      <Typography variant="body2">{tenant.invoiceAddress}</Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t("Not set")}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(tenant.createdAt)}</TableCell>
                  <TableCell>{formatDate(tenant.trialEndDate)}</TableCell>
                  <TableCell>
                    {tenant.isSubscribed ? (
                      <Chip size="small" color="primary" label={t("Subscribed")} />
                    ) : tenant.isExpired ? (
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
                    {tenant.isSubscribed ? (
                      <Button
                        size="small"
                        startIcon={<UndoIcon />}
                        disabled={mutating}
                        onClick={() =>
                          subscription.mutate({ tenantId: tenant.id, subscribed: false })
                        }
                      >
                        {t("Revert to trial")}
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="small"
                          startIcon={<MoreTimeIcon />}
                          disabled={mutating}
                          onClick={() => extend.mutate(tenant.id)}
                        >
                          {t("Extend {{days}} days", { days: EXTEND_DAYS })}
                        </Button>
                        <Button
                          size="small"
                          startIcon={<WorkspacePremiumIcon />}
                          disabled={mutating}
                          onClick={() =>
                            subscription.mutate({ tenantId: tenant.id, subscribed: true })
                          }
                        >
                          {t("Convert to subscribed")}
                        </Button>
                      </>
                    )}
                    <IconButton
                      size="small"
                      aria-label={t("Edit tenant")}
                      disabled={mutating}
                      onClick={() => startEdit(tenant)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={t("Delete tenant")}
                      disabled={mutating}
                      onClick={() => {
                        remove.reset();
                        setDeleting(tenant);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {tenants.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
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

      <Dialog open={editing !== null} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t("Edit tenant")}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {update.isError ? (
            <Alert severity="error">{t("Saving the tenant failed. Please try again.")}</Alert>
          ) : null}
          <TextField
            autoFocus
            required
            label={t("Organization")}
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 200 } }}
            error={editName.trim().length === 0}
            margin="dense"
          />
          <TextField
            label={t("Invoice address")}
            value={editInvoiceAddress}
            onChange={(event) => setEditInvoiceAddress(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 500 } }}
            multiline
            minRows={2}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)} disabled={update.isPending}>
            {t("Cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={submitEdit}
            disabled={update.isPending || editName.trim().length === 0}
          >
            {t("Save")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleting !== null} onClose={() => setDeleting(null)}>
        <DialogTitle>{t("Delete tenant")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              'This permanently deletes "{{name}}" and its memberships. Other services drop the tenant from their records as well. This cannot be undone.',
              { name: deleting?.name ?? "" },
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleting(null)} disabled={remove.isPending}>
            {t("Cancel")}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleting && remove.mutate(deleting.id)}
            disabled={remove.isPending}
          >
            {t("Delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
