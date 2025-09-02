import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Stack,
  Divider,
  Paper,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type PhoneNumber = {
  id?: string;
  number: string; // E.164
  type: "Mobile" | "Home" | "Work" | "Other";
};

type GuardianFormData = {
  givenName: string;
  familyName: string;
  dateOfBirth?: string;
  email: string;
  bsn: string;
  phoneNumbers: PhoneNumber[];
};

type GuardianFormProps = {
  guardianId?: string;
  initialData?: GuardianFormData;
  onSubmit: (data: GuardianFormData) => Promise<void>;
  isLoading?: boolean;
  title: string;
};

export const GuardianForm = ({
  guardianId,
  initialData,
  onSubmit,
  isLoading = false,
  title,
}: GuardianFormProps) => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GuardianFormData>({
    defaultValues: initialData ?? {
      givenName: "",
      familyName: "",
      email: "",
      bsn: "",
      phoneNumbers: [],
    },
  });

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({
    control,
    name: "phoneNumbers",
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: GuardianFormData) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
      navigate("/guardians");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : t("guardian.errors.saveFailed", "An error occurred while saving the guardian"),
      );
    }
  };

  const addPhone = () => {
    if (phoneFields.length >= 10) return;
    appendPhone({ number: "", type: "Mobile" });
  };
  const removePhoneNumber = (index: number) => removePhone(index);

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Typography variant="h4" gutterBottom>
        {t(title)}
      </Typography>
      {/* Error Alert */}
      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      {/* Personal Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t("Personal Information")}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="givenName"
                control={control}
                rules={{ required: t("Given name is required") }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t("Given Name")}
                    error={!!errors.givenName}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="familyName"
                control={control}
                rules={{ required: t("Family name is required") }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t("Family Name")}
                    error={!!errors.familyName}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label={t("Date of Birth")} type="date" />
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t("Contact Information")}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="email"
                control={control}
                rules={{
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t("Invalid email address"),
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t("Email")}
                    type="email"
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Stack spacing={2}>
                {phoneFields.length === 0 && (
                  <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {t("No phone numbers added")}
                    </Typography>
                    <Button
                      startIcon={<Add />}
                      size="small"
                      onClick={addPhone}
                      disabled={phoneFields.length >= 10}
                    >
                      {t("Add Phone")}
                    </Button>
                  </Paper>
                )}
                {phoneFields.map((field, index) => (
                  <Paper
                    key={field.id}
                    variant="outlined"
                    sx={{ p: 2, position: "relative", borderRadius: 2 }}
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Controller
                          name={`phoneNumbers.${index}.type`}
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth size="small">
                              <InputLabel>{t("Type")}</InputLabel>
                              <Select {...field} label={t("Type")}>
                                <MenuItem value="Mobile">{t("Mobile")}</MenuItem>
                                <MenuItem value="Home">{t("Home")}</MenuItem>
                                <MenuItem value="Work">{t("Work")}</MenuItem>
                                <MenuItem value="Other">{t("Other")}</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 8 }}>
                        <Controller
                          name={`phoneNumbers.${index}.number`}
                          control={control}
                          rules={{
                            validate: (val) =>
                              !val ||
                              /^\+?[1-9]\d{7,18}$/.test(val) ||
                              t("Must be E.164 format (e.g. +31612345678)"),
                          }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label={t("Phone Number")}
                              error={!!errors.phoneNumbers?.[index]?.number}
                              placeholder={t("+31612345678")}
                              size="small"
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                    <IconButton
                      color="error"
                      onClick={() => removePhoneNumber(index)}
                      size="small"
                      aria-label={t("Remove phone number")}
                      sx={{ position: "absolute", top: 4, right: 4 }}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
                {phoneFields.length > 0 && phoneFields.length < 10 && (
                  <Button
                    startIcon={<Add />}
                    variant="outlined"
                    size="small"
                    onClick={addPhone}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    {t("Add Phone")}
                  </Button>
                )}
                {phoneFields.length >= 10 && (
                  <Typography variant="caption" color="text.secondary">
                    {t("Maximum phone numbers reached")}
                  </Typography>
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Actions */}
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={() => navigate("/guardians")} disabled={isLoading}>
          {t("Cancel")}
        </Button>
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? t("Saving...") : guardianId ? t("Update Guardian") : t("Create Guardian")}
        </Button>
      </Box>
    </Box>
  );
};
