import React from "react";
import { useTranslation } from "react-i18next";
import Switch from "@mui/material/Switch";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
  getListTenantsQueryKey,
  useActivateTenant,
  useDeactivateTenant,
} from "@api/tenants/endpoints/tenants/tenants";

type TenantStatusSwitchProps = {
  id: string;
  isActive: boolean;
  name: string;
};

export const TenantStatusSwitch: React.FC<TenantStatusSwitchProps> = ({
  id,
  isActive,
  name,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const activate = useActivateTenant();
  const deactivate = useDeactivateTenant();

  const isPending = activate.isPending || deactivate.isPending;

  const handleSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getListTenantsQueryKey() });
  };

  const handleError = () => {
    enqueueSnackbar(
      t("form.errors.saveFailed", "An error occurred while saving. Please try again."),
      { variant: "error" },
    );
  };

  const handleChange = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const mutation = checked ? activate : deactivate;
    mutation.mutate({ id }, { onSuccess: handleSuccess, onError: handleError });
  };

  return (
    <Switch
      checked={isActive}
      disabled={isPending}
      onChange={handleChange}
      slotProps={{
        input: {
          "aria-label": isActive
            ? t("deactivate.tenant.ariaLabel", "Deactivate {{name}}", { name })
            : t("activate.tenant.ariaLabel", "Activate {{name}}", { name }),
        },
      }}
    />
  );
};
