import { useState } from "react";
import { type AddChildCommand } from "@api/crm/models/addChildCommand";
import { useForm } from "react-hook-form";
import { Form, FormActions, FormDatePicker, FormSection, FormTextField } from "@components/forms";
import { FormPageHeader } from "@components/layout/FormPageHeader";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import ChildCareRoundedIcon from "@mui/icons-material/ChildCareRounded";
import { getListChildrenQueryKey, useAddChild } from "@api/crm/endpoints/children/children";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { type UnprocessableEntityResponse } from "@api/crm/models/unprocessableEntityResponse";

const NewChildPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useAddChild();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formContext = useForm<AddChildCommand>({
    defaultValues: {
      givenName: "",
      familyName: "",
    },
  });

  const { setError } = formContext;

  const onSubmit = (data: AddChildCommand) => {
    setSubmitError(null);
    mutate({ data: data }, { onSuccess: onSuccess, onError: onMutateError });
  };

  const onSuccess = (childId: string) => {
    void queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey({}) });
    navigate(`/children/${childId}`);
  };

  const onMutateError = (error: UnprocessableEntityResponse) => {
    if (Array.isArray(error?.errors)) {
      error.errors.forEach((propertyError) => {
        setError(propertyError.property as any, {
          type: "server",
          message: propertyError.title,
        });
      });
    } else {
      setSubmitError(t("An error occurred while saving. Please try again."));
    }
  };

  return (
    <Container maxWidth="md" disableGutters>
      <Stack spacing={3} sx={{ pb: 4 }}>
        <FormPageHeader
          title={t("New Child")}
          subtitle={t("Add a new child to the administration.")}
          backTo="/children"
        />
        {submitError && (
          <Alert severity="error" onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}
        <Form formContext={formContext} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <FormSection
              title={t("Personal Information")}
              description={t("Name, date of birth and identification.")}
              icon={<ChildCareRoundedIcon />}
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
                    required
                    transform={{
                      output: (value) => (value ? value.format("YYYY-MM-DD") : null),
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormTextField
                    name="CID"
                    label={t("CID")}
                    fullWidth
                    helperText={t(
                      "A unique child identification number will be automatically assigned when you save.",
                    )}
                  />
                </Grid>
              </Grid>
            </FormSection>
            <FormActions onCancel={() => navigate("/children")} isSubmitting={isPending} />
          </Stack>
        </Form>
      </Stack>
    </Container>
  );
};

export const Component = NewChildPage;
