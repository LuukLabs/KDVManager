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
  TextField,
  Box,
  Avatar,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { Search } from "@mui/icons-material";
import { useLinkGuardianToChild, useListGuardians } from "@api/endpoints/guardians/guardians";

// Type definitions (to be replaced with generated API types)
import type { GuardianListVM } from "@api/models/guardianListVM";
import { GuardianRelationshipType } from "@api/models/guardianRelationshipType";

type LinkGuardianFormData = {
  guardianId: string;
  relationshipType: GuardianRelationshipType;
  isPrimaryContact: boolean;
  isEmergencyContact: boolean;
};

type LinkExistingGuardianDialogProps = {
  open: boolean;
  onClose: () => void;
  childId: string;
  onSuccess: () => void;
};

// Mock hooks (to be replaced with actual API hooks)
const useSearchGuardians = (searchTerm: string) => {
  // Only search if searchTerm has at least 2 characters
  const shouldSearch = searchTerm.length >= 2;

  const { data, isLoading } = useListGuardians(
    {
      search: searchTerm,
      pageNumber: 1,
      pageSize: 20,
    },
    {
      query: {
        enabled: shouldSearch,
      },
    },
  );

  return {
    data: shouldSearch ? (data?.value ?? []) : [],
    isLoading: shouldSearch ? isLoading : false,
  };
};

export const LinkExistingGuardianDialog = ({
  open,
  onClose,
  childId,
  onSuccess,
}: LinkExistingGuardianDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuardian, setSelectedGuardian] = useState<GuardianListVM | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { t } = useTranslation();

  const { data: guardians = [], isLoading: searching } = useSearchGuardians(searchTerm);
  const linkMutation = useLinkGuardianToChild();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<LinkGuardianFormData>({
    defaultValues: {
      guardianId: "",
      relationshipType: "Guardian",
      isPrimaryContact: false,
      isEmergencyContact: false,
    },
  });

  const watchedGuardianId = watch("guardianId");

  const handleFormSubmit = async (data: LinkGuardianFormData) => {
    try {
      setSubmitError(null);

      await linkMutation.mutateAsync({
        childId,
        guardianId: data.guardianId,
        data: {
          relationshipType: data.relationshipType,
          isPrimaryContact: data.isPrimaryContact,
          isEmergencyContact: data.isEmergencyContact,
        },
      });
      onSuccess();
      handleClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t("Failed to link guardian to child"));
    }
  };

  const handleClose = () => {
    reset();
    setSearchTerm("");
    setSelectedGuardian(null);
    setSubmitError(null);
    onClose();
  };

  const handleGuardianSelect = (guardian: GuardianListVM | null) => {
    setSelectedGuardian(guardian);
    // Update form field
    if (guardian) {
      // Set the guardianId in the form
      reset({
        guardianId: guardian.id,
        relationshipType: GuardianRelationshipType.Parent,
        isPrimaryContact: false,
        isEmergencyContact: false,
      });
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("Link Existing Guardian")}</DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Search Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                {t("Search for Guardian")}
              </Typography>
              <TextField
                fullWidth
                placeholder={t("Search by name...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: "action.active" }} />,
                }}
                sx={{ mb: 2 }}
              />

              {/* Search Results */}
              {searching ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : searchTerm && guardians.length === 0 ? (
                <Alert severity="info">
                  {t('No guardians found matching "{{searchTerm}}".', { searchTerm })}
                  <Button
                    variant="text"
                    onClick={() => window.open("/guardians/new", "_blank")}
                    sx={{ ml: 1 }}
                  >
                    {t("Create new guardian")}
                  </Button>
                </Alert>
              ) : guardians.length > 0 ? (
                <Box>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    {t("Found {{count}} guardian(s)", { count: guardians.length })}
                  </Typography>
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap={1}
                    maxHeight={300}
                    overflow="auto"
                    sx={{
                      "&::-webkit-scrollbar": {
                        width: 6,
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "transparent",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(0,0,0,0.2)",
                        borderRadius: 3,
                      },
                    }}
                  >
                    {guardians.map((guardian: GuardianListVM) => (
                      <Card
                        key={guardian.id}
                        variant={selectedGuardian?.id === guardian.id ? "outlined" : "elevation"}
                        sx={{
                          cursor: "pointer",
                          border: selectedGuardian?.id === guardian.id ? 2 : 1,
                          borderColor:
                            selectedGuardian?.id === guardian.id ? "primary.main" : "divider",
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                          minHeight: 80,
                          flexShrink: 0,
                        }}
                        onClick={() => handleGuardianSelect(guardian)}
                      >
                        <CardContent sx={{ py: 2, px: 2, "&:last-child": { pb: 2 } }}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
                              {getInitials(guardian.fullName)}
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="subtitle2" fontWeight="medium">
                                {guardian.fullName}
                              </Typography>
                              <Box display="flex" gap={2} mt={0.5}>
                                <Typography variant="body2" color="text.secondary">
                                  {guardian.email ?? t("No email")}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {guardian.primaryPhoneNumber ?? t("No phone")}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              ) : null}
            </Grid>

            {/* Relationship Details - Only show if guardian is selected */}
            {selectedGuardian && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    {t("Relationship Details")}
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {t("Selected: ")}
                    <strong>{selectedGuardian.fullName}</strong>
                  </Alert>
                </Grid>

                {/* Hidden field for guardianId */}
                <Controller
                  name="guardianId"
                  control={control}
                  render={({ field }) => <input type="hidden" {...field} />}
                />

                {/* Relationship Type */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="relationshipType"
                    control={control}
                    rules={{ required: t("Please select a relationship type") }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.relationshipType}>
                        <InputLabel>{t("Relationship Type")}</InputLabel>
                        <Select {...field} label={t("Relationship Type")}>
                          {Object.entries(GuardianRelationshipType).map(([key, value]) => (
                            <MenuItem key={key} value={value}>
                              {key}
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
                    {t("Contact Options")}
                  </Typography>
                  <Controller
                    name="isPrimaryContact"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label={t("Primary Contact")}
                      />
                    )}
                  />
                  <Controller
                    name="isEmergencyContact"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label={t("Emergency Contact")}
                      />
                    )}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={linkMutation.isPending}>
            {t("Cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={linkMutation.isPending || !watchedGuardianId}
          >
            {linkMutation.isPending ? t("Linking...") : t("Link Guardian")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
