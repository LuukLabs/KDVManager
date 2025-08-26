import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  Autocomplete,
  TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useListChildren } from "@api/endpoints/children/children";
import { relationshipTypeOptions } from "@utils/guardianRelationshipTypes";
import { formatDate } from "@utils/formatDate";

// Type definitions (to be replaced with generated API types)
type Child = {
  id: string;
  fullName: string;
  dateOfBirth: string;
};

type Guardian = {
  id: string;
  fullName: string;
  email: string;
};

type LinkGuardianToChildFormData = {
  childId: string;
  guardianId: string;
  relationshipType: "Mother" | "Father" | "Guardian" | "Grandparent" | "Other";
  isPrimaryContact: boolean;
  isEmergencyContact: boolean;
};

type LinkGuardianToChildDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LinkGuardianToChildFormData) => Promise<void>;
  children: Child[];
  guardians: Guardian[];
  isLoading?: boolean;
  mode: "linkToChild" | "linkToGuardian";
  preselectedChildId?: string;
  preselectedGuardianId?: string;
};

const useListGuardians = () => ({
  data: [] as Guardian[],
  isLoading: false,
});

export const LinkGuardianToChildDialog = ({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  mode,
  preselectedChildId,
  preselectedGuardianId,
}: LinkGuardianToChildDialogProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: children, isLoading: childrenLoading } = useListChildren({
    pageNumber: 1,
    pageSize: 100,
  });
  const { data: guardians = [], isLoading: guardiansLoading } = useListGuardians();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LinkGuardianToChildFormData>({
    defaultValues: {
      childId: preselectedChildId ?? "",
      guardianId: preselectedGuardianId ?? "",
      relationshipType: "Guardian",
      isPrimaryContact: false,
      isEmergencyContact: false,
    },
  });

  const handleFormSubmit = async (data: LinkGuardianToChildFormData) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
      handleClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to link guardian to child");
    }
  };

  const handleClose = () => {
    reset();
    setSubmitError(null);
    onClose();
  };

  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === "linkToChild"
          ? t(
              "guardians:linkGuardianToChildDialog.titleLinkGuardianToChild",
              "Link Guardian to Child",
            )
          : t(
              "guardians:linkGuardianToChildDialog.titleLinkChildToGuardian",
              "Link Child to Guardian",
            )}
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Child Selection */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="childId"
                control={control}
                rules={{
                  required: t(
                    "guardians:linkGuardianToChildDialog.selectChildRequired",
                    "Please select a child",
                  ),
                }}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    value={children?.value.find((child) => child.id === value) ?? null}
                    onChange={(_, newValue) => onChange(newValue?.id ?? "")}
                    options={children?.value ?? []}
                    getOptionLabel={(option) => option.fullName}
                    loading={childrenLoading}
                    disabled={!!preselectedChildId || childrenLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("guardians:linkGuardianToChildDialog.childLabel", "Child")}
                        error={!!errors.childId}
                        helperText={errors.childId?.message}
                        fullWidth
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <div>
                          <Typography variant="body1">{option.fullName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t("guardians:linkGuardianToChildDialog.bornLabel", "Born:")}{" "}
                            {formatDate(option.dateOfBirth)}
                          </Typography>
                        </div>
                      </li>
                    )}
                  />
                )}
              />
            </Grid>

            {/* Guardian Selection */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="guardianId"
                control={control}
                rules={{
                  required: t(
                    "guardians:linkGuardianToChildDialog.selectGuardianRequired",
                    "Please select a guardian",
                  ),
                }}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    value={guardians.find((guardian) => guardian.id === value) ?? null}
                    onChange={(_, newValue) => onChange(newValue?.id ?? "")}
                    options={guardians}
                    getOptionLabel={(option) => option.fullName}
                    loading={guardiansLoading}
                    disabled={!!preselectedGuardianId || guardiansLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("guardians:linkGuardianToChildDialog.guardianLabel", "Guardian")}
                        error={!!errors.guardianId}
                        helperText={errors.guardianId?.message}
                        fullWidth
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <div>
                          <Typography variant="body1">{option.fullName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.email}
                          </Typography>
                        </div>
                      </li>
                    )}
                  />
                )}
              />
            </Grid>

            {/* Relationship Type */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="relationshipType"
                control={control}
                rules={{
                  required: t(
                    "guardians:linkGuardianToChildDialog.selectRelationshipTypeRequired",
                    "Please select a relationship type",
                  ),
                }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.relationshipType}>
                    <InputLabel>
                      {t(
                        "guardians:linkGuardianToChildDialog.relationshipTypeLabel",
                        "Relationship Type",
                      )}
                    </InputLabel>
                    <Select
                      {...field}
                      label={t(
                        "guardians:linkGuardianToChildDialog.relationshipTypeLabel",
                        "Relationship Type",
                      )}
                    >
                      {relationshipTypeOptions.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {t(`guardians:relationshipType.${type.value}`, type.label)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Contact Options */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t("guardians:linkGuardianToChildDialog.contactOptionsLabel", "Contact Options")}
              </Typography>
              <Controller
                name="isPrimaryContact"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label={t(
                      "guardians:linkGuardianToChildDialog.primaryContactLabel",
                      "Primary Contact",
                    )}
                  />
                )}
              />
              <Controller
                name="isEmergencyContact"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label={t(
                      "guardians:linkGuardianToChildDialog.emergencyContactLabel",
                      "Emergency Contact",
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            {t("common:cancel", "Cancel")}
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading
              ? t("guardians:linkGuardianToChildDialog.linking", "Linking...")
              : t("guardians:linkGuardianToChildDialog.link", "Link")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
