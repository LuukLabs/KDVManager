import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import ChildCareRoundedIcon from "@mui/icons-material/ChildCareRounded";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { type AddChildCommand } from "@api/crm/models/addChildCommand";
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

type ChildFormProps = {
  onSubmit: (data: AddChildCommand) => Promise<void>;
};

export const ChildForm = ({ onSubmit }: ChildFormProps) => {
  const { t } = useTranslation();
  const formContext = useForm<AddChildCommand>({
    defaultValues: {
      givenName: "",
      familyName: "",
    },
  });
  const { handleSubmit, submitError, clearSubmitError } = useFormSubmit<AddChildCommand>({
    onSubmit,
    setError: formContext.setError,
  });

  return (
    <Form formContext={formContext} onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <FormErrorAlert message={submitError} onClose={clearSubmitError} />
        <FormSection
          title={t("Basic Information")}
          description={t("Name, date of birth and identification.")}
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
              label={t("Date of birth")}
              name="dateOfBirth"
              required
              transform={isoDateTransform}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
        </FormSection>
        <FormActions submitLabel={t("Save", { ns: "common" })} cancelTo="/children" />
      </Stack>
    </Form>
  );
};
