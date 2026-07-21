import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, TextField, Typography, Stack, Alert } from "@mui/material";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { useTranslation } from "react-i18next";
import { provisionTenant, myTenantQueryKey } from "@api/tenant/tenant";
import { trialStatusQueryKey } from "@api/trial/trial";
import { refreshAuthToken } from "@lib/auth/auth";

/**
 * First-run onboarding: a brand-new user with no tenant names their organization.
 * Provisioning creates the tenant (and starts the trial), then we force a token
 * refresh so the new tenant claim is present before entering the app.
 */
export function Component() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const mutation = useMutation({
    mutationFn: async (orgName: string) => {
      const tenant = await provisionTenant(orgName);
      await refreshAuthToken();
      return tenant;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: myTenantQueryKey });
      await queryClient.invalidateQueries({ queryKey: trialStatusQueryKey });
      navigate("/schedule", { replace: true });
    },
  });

  const trimmed = name.trim();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (trimmed.length > 0) mutation.mutate(trimmed);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        p: 3,
        gap: 2,
      }}
    >
      <StorefrontOutlinedIcon color="action" sx={{ fontSize: 64 }} />
      <Typography variant="h4" component="h1">
        {t("Welcome to KDVManager")}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
        {t("Let's set up your organization to get started with your 30-day free trial.")}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 420, mt: 1 }}>
        <Stack spacing={2}>
          <TextField
            label={t("Organization name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            fullWidth
            disabled={mutation.isPending}
            slotProps={{ htmlInput: { maxLength: 200 } }}
          />
          {mutation.isError ? (
            <Alert severity="error">
              {t("Something went wrong creating your organization. Please try again.")}
            </Alert>
          ) : null}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={trimmed.length === 0 || mutation.isPending}
          >
            {mutation.isPending ? t("Setting up…") : t("Create organization")}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
