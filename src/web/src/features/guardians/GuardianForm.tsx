import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  IconButton,
  Stack,
  Divider,
  Paper,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Form, FormDatePicker, FormSelect, FormTextField } from "@components/forms";

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
  const formContext = useForm<GuardianFormData>({
    defaultValues: initialData ?? {
      givenName: "",
      familyName: "",
      email: "",
      bsn: "",
      phoneNumbers: [],
    },
  });

  const {
    control,
    reset,
  } = formContext;

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
      // TODO: Map server side validation errors similar to NewChildPage when backend provides shape
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
    <Form formContext={formContext} onSubmit={handleFormSubmit}>
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
              <FormTextField name="givenName" label={t("Given name")} required fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="familyName" label={t("Family name")} required fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormDatePicker
                label={t("Date of birth")}
                name="dateOfBirth"
                transform={{
                  output: (value) => (value ? value.format("YYYY-MM-DD") : null),
                }}
                slotProps={{ textField: { fullWidth: true } }}
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
              <FormTextField
                name="email"
                label={t("Email")}
                fullWidth
                type="email"
                rules={{
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t("Invalid email address"),
                  },
                }}
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
                        <FormSelect
                          name={`phoneNumbers.${index}.type`}
                          label={t("Type")}
                          options={[
                            { id: "Mobile", label: t("Mobile") },
                            { id: "Home", label: t("Home") },
                            { id: "Work", label: t("Work") },
                            { id: "Other", label: t("Other") },
                          ]}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 8 }}>
                        <FormTextField
                          name={`phoneNumbers.${index}.number`}
                          rules={{
                            validate: (val) =>
                              !val ||
                              /^\+?[1-9]\d{7,18}$/.test(val) ||
                              t("Must be E.164 format (e.g. +31612345678)"),
                          }}
                          fullWidth
                          label={t("Phone Number")}
                          placeholder={t("+31612345678")}
                          size="small"
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
    </Form>
  );
};
