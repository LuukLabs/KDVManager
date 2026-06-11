import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Box, Grid, Button, Alert, IconButton, Stack, Typography, alpha } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import ContactPhoneOutlinedIcon from "@mui/icons-material/ContactPhoneOutlined";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormActions,
  FormDatePicker,
  FormSection,
  FormSelect,
  FormTextField,
} from "@components/forms";

const MAX_PHONE_NUMBERS = 10;

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
  initialData?: GuardianFormData;
  onSubmit: (data: GuardianFormData) => Promise<void>;
  isLoading?: boolean;
};

export const GuardianForm = ({ initialData, onSubmit, isLoading = false }: GuardianFormProps) => {
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

  const { control, reset } = formContext;

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
    if (phoneFields.length >= MAX_PHONE_NUMBERS) return;
    appendPhone({ number: "", type: "Mobile" });
  };

  const phoneTypeOptions = [
    { id: "Mobile", label: t("Mobile") },
    { id: "Home", label: t("Home") },
    { id: "Work", label: t("Work") },
    { id: "Other", label: t("Other") },
  ];

  return (
    <Form formContext={formContext} onSubmit={handleFormSubmit}>
      <Stack spacing={3}>
        {submitError && (
          <Alert severity="error" onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}
        <FormSection
          title={t("Personal Information")}
          description={t("Name and date of birth.")}
          icon={<PersonOutlineRoundedIcon />}
        >
          <Grid container spacing={2.5}>
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
        </FormSection>
        <FormSection
          title={t("Contact Information")}
          description={t("How this guardian can be reached.")}
          icon={<ContactPhoneOutlinedIcon />}
        >
          <Stack spacing={2.5}>
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
            {phoneFields.length === 0 ? (
              <Box
                sx={(theme) => ({
                  p: 3,
                  textAlign: "center",
                  borderRadius: 2,
                  border: `1px dashed ${theme.palette.divider}`,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                })}
              >
                <PhoneIphoneRoundedIcon sx={{ color: "text.disabled", mb: 0.5 }} />
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
                  {t("No phone numbers added")}
                </Typography>
                <Button
                  startIcon={<AddRoundedIcon />}
                  variant="outlined"
                  size="small"
                  onClick={addPhone}
                >
                  {t("Add Phone")}
                </Button>
              </Box>
            ) : (
              <Stack spacing={2}>
                {phoneFields.map((field, index) => (
                  <Stack
                    key={field.id}
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "flex-start" }}
                  >
                    <Grid container spacing={1.5} sx={{ flexGrow: 1 }}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormSelect
                          name={`phoneNumbers.${index}.type`}
                          label={t("Type")}
                          options={phoneTypeOptions}
                          fullWidth
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
                          placeholder="+31612345678"
                        />
                      </Grid>
                    </Grid>
                    <IconButton
                      color="error"
                      onClick={() => removePhone(index)}
                      aria-label={t("Remove phone number")}
                      sx={{ mt: 1 }}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
                {phoneFields.length < MAX_PHONE_NUMBERS ? (
                  <Button
                    startIcon={<AddRoundedIcon />}
                    variant="text"
                    size="small"
                    onClick={addPhone}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    {t("Add Phone")}
                  </Button>
                ) : (
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {t("Maximum phone numbers reached")}
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>
        </FormSection>
        <FormActions onCancel={() => navigate("/guardians")} isSubmitting={isLoading} />
      </Stack>
    </Form>
  );
};
