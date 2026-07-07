import { useTranslation } from "react-i18next";
import { Grid, Button, Typography, IconButton, Stack, Divider, Paper } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import ContactPhoneOutlinedIcon from "@mui/icons-material/ContactPhoneOutlined";
import { useForm, useFieldArray } from "react-hook-form";
import { type PhoneNumberType } from "@api/crm/models/phoneNumberType";
import {
  Form,
  FormActions,
  FormDatePicker,
  FormErrorAlert,
  FormSection,
  FormSelect,
  FormTextField,
  isoDateTransform,
  useFormSubmit,
} from "@components/forms";

type PhoneNumber = {
  number: string; // E.164
  type: PhoneNumberType;
};

export type GuardianFormData = {
  givenName: string;
  familyName: string;
  dateOfBirth?: string | null;
  email: string;
  phoneNumbers: PhoneNumber[];
};

type GuardianFormProps = {
  onSubmit: (data: GuardianFormData) => Promise<void>;
};

const MAX_PHONE_NUMBERS = 10;

export const GuardianForm = ({ onSubmit }: GuardianFormProps) => {
  const { t } = useTranslation();
  const formContext = useForm<GuardianFormData>({
    defaultValues: {
      givenName: "",
      familyName: "",
      email: "",
      phoneNumbers: [],
    },
  });

  const { handleSubmit, submitError, clearSubmitError } = useFormSubmit<GuardianFormData>({
    onSubmit,
    setError: formContext.setError,
  });

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({
    control: formContext.control,
    name: "phoneNumbers",
  });

  const phoneTypeOptions = [
    { id: "Mobile", label: t("Mobile") },
    { id: "Home", label: t("Home") },
    { id: "Work", label: t("Work") },
    { id: "Other", label: t("Other") },
  ];

  const addPhone = () => {
    if (phoneFields.length >= MAX_PHONE_NUMBERS) return;
    appendPhone({ number: "", type: "Mobile" });
  };

  return (
    <Form formContext={formContext} onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <FormErrorAlert message={submitError} onClose={clearSubmitError} />
        <FormSection
          title={t("Basic Information")}
          description={t("Name and date of birth.")}
          icon={<PersonOutlineRoundedIcon />}
        >
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
              transform={isoDateTransform}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
        </FormSection>
        <FormSection
          title={t("Contact Information")}
          description={t("How this guardian can be reached.")}
          icon={<ContactPhoneOutlinedIcon />}
        >
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
                  <Button startIcon={<Add />} size="small" onClick={addPhone}>
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
                        options={phoneTypeOptions}
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
                    onClick={() => removePhone(index)}
                    size="small"
                    aria-label={t("Remove phone number")}
                    sx={{ position: "absolute", top: 4, right: 4 }}
                  >
                    <Remove fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
              {phoneFields.length > 0 && phoneFields.length < MAX_PHONE_NUMBERS && (
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
              {phoneFields.length >= MAX_PHONE_NUMBERS && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {t("Maximum phone numbers reached")}
                </Typography>
              )}
            </Stack>
          </Grid>
        </FormSection>
        <FormActions submitLabel={t("Create Guardian")} cancelTo="/guardians" />
      </Stack>
    </Form>
  );
};
