import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import ContactMailRoundedIcon from "@mui/icons-material/ContactMailRounded";
import ChildCareRoundedIcon from "@mui/icons-material/ChildCareRounded";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormActions,
  FormDatePicker,
  FormErrorAlert,
  FormSection,
  FormTextField,
  isoDateTransform,
  useFormSubmit,
} from "@components/forms";
import type { CreateWaitlistEntry } from "./waitlist.types";

type WaitlistEntryFormProps = {
  onSubmit: (entry: CreateWaitlistEntry) => Promise<void>;
};

export const WaitlistEntryForm = ({ onSubmit }: WaitlistEntryFormProps) => {
  const { t } = useTranslation();
  const formContext = useForm<CreateWaitlistEntry>({
    defaultValues: {
      givenName: "",
      familyName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      requestedDays: "",
      notes: "",
    },
  });
  const { handleSubmit, submitError, clearSubmitError } = useFormSubmit<CreateWaitlistEntry>({
    onSubmit,
    setError: formContext.setError,
  });

  return (
    <Form formContext={formContext} onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <FormErrorAlert message={submitError} onClose={clearSubmitError} />
        <FormSection
          title={t("Child and request")}
          description={t("Record the details needed to assess this childcare request.")}
          icon={<ChildCareRoundedIcon />}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField name="givenName" label={t("Voornaam")} required fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField name="familyName" label={t("Achternaam")} required fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormDatePicker
              name="dateOfBirth"
              label={t("Date of birth")}
              required
              transform={isoDateTransform}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormDatePicker
              name="desiredStartDate"
              label={t("Desired start date")}
              required
              transform={isoDateTransform}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormTextField
              name="requestedDays"
              label={t("Requested days")}
              helperText={t("For example: Monday and Thursday")}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormTextField name="notes" label={t("Notes")} multiline minRows={3} fullWidth />
          </Grid>
        </FormSection>
        <FormSection
          title={t("Contact")}
          description={t("The person to contact when a place may become available.")}
          icon={<ContactMailRoundedIcon />}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField name="contactName" label={t("Contact name")} required fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              name="contactEmail"
              label={t("Email")}
              type="email"
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField name="contactPhone" label={t("Phone number")} fullWidth />
          </Grid>
        </FormSection>
        <FormActions submitLabel={t("Add to waitlist")} cancelTo="/waitlist" />
      </Stack>
    </Form>
  );
};
