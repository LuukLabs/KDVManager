import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import { Controller, useWatch } from "react-hook-form";
import { weekdayOptions } from "./waitlist.labels";
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
  FormSelect,
  FormTimeField,
  isoDateTransform,
  useFormSubmit,
} from "@components/forms";
import type { CreateWaitlistEntry, ChildcareType } from "./waitlist.types";

type WaitlistEntryFormValues = Omit<CreateWaitlistEntry, "careType"> & {
  careType?: ChildcareType | "" | null;
};

type WaitlistEntryFormProps = {
  onSubmit: (entry: CreateWaitlistEntry) => Promise<void>;
  entry?: CreateWaitlistEntry;
};

export const WaitlistEntryForm = ({ onSubmit, entry }: WaitlistEntryFormProps) => {
  const { t } = useTranslation();
  const formContext = useForm<WaitlistEntryFormValues>({
    defaultValues: {
      givenName: "",
      familyName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      requestedDays: "",
      notes: "",
      location: "",
      preferredGroup: "",
      careType: null,
      weekdays: [],
      startTime: null,
      endTime: null,
      priority: 0,
      priorityReason: "",
      priorityExplanation: "",
      ...entry,
    },
  });
  const priority = useWatch({ control: formContext.control, name: "priority" });
  const { handleSubmit, submitError, clearSubmitError } = useFormSubmit<WaitlistEntryFormValues>({
    onSubmit: (values) =>
      onSubmit({
        ...values,
        priority: Number(values.priority),
        careType: values.careType === "" ? null : (values.careType ?? null),
      }),
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField name="location" label={t("Preferred location")} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect
              name="careType"
              label={t("Childcare type")}
              fullWidth
              options={[
                { id: "", label: t("Not specified") },
                { id: "Daycare", label: t("Daycare") },
                { id: "AfterSchool", label: t("After-school care") },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormTextField name="preferredGroup" label={t("Preferred group")} fullWidth />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography id="weekdays-label">{t("Fixed weekdays")}</Typography>
            <Controller
              name="weekdays"
              control={formContext.control}
              render={({ field }) => (
                <Stack
                  direction="row"
                  sx={{ flexWrap: "wrap" }}
                  role="group"
                  aria-labelledby="weekdays-label"
                >
                  {weekdayOptions(t).map((day) => (
                    <FormControlLabel
                      key={day.id}
                      label={day.label}
                      control={
                        <Checkbox
                          checked={field.value.includes(day.id)}
                          onChange={(_, checked) =>
                            field.onChange(
                              checked
                                ? [...field.value, day.id]
                                : field.value.filter((value) => value !== day.id),
                            )
                          }
                        />
                      }
                    />
                  ))}
                </Stack>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTimeField
              name="startTime"
              label={t("Requested start time")}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTimeField
              name="endTime"
              label={t("Requested end time")}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormTextField
              name="requestedDays"
              label={t("Requested days")}
              helperText={t("Additional preferences or the original request text")}
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
            <FormTextField name="contactEmail" label={t("Email")} type="email" required fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField name="contactPhone" label={t("Phone number")} fullWidth />
          </Grid>
        </FormSection>
        <FormSection
          title={t("Priority")}
          description={t(
            "Higher priorities appear first within each status. Equal priorities use registration order.",
          )}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              name="priority"
              label={t("Priority (0–100)")}
              type="number"
              fullWidth
              required
              rules={{
                min: { value: 0, message: t("Priority must be between 0 and 100") },
                max: { value: 100, message: t("Priority must be between 0 and 100") },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              name="priorityReason"
              label={t("Priority reason")}
              fullWidth
              required={Number(priority) > 0}
              helperText={t("Use your organisation's reason, for example sibling or employee.")}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormTextField
              name="priorityExplanation"
              label={t("Priority explanation")}
              fullWidth
              multiline
              minRows={2}
              required={Number(priority) > 0}
            />
          </Grid>
        </FormSection>
        <FormActions
          submitLabel={entry ? t("Save request") : t("Add to waitlist")}
          cancelTo="/waitlist"
        />
      </Stack>
    </Form>
  );
};
