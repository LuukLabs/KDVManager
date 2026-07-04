import { type AddChildCommand } from "@api/crm/models/addChildCommand";
import { useForm } from "react-hook-form";
import { Form, FormDatePicker, FormTextField } from "@components/forms";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { Alert, Box, Container, Typography } from "@mui/material";
import { getListChildrenQueryKey, useAddChild } from "@api/crm/endpoints/children/children";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { type UnprocessableEntityResponse } from "@api/crm/models/unprocessableEntityResponse";

const NewChildPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate } = useAddChild();
  const navigate = useNavigate();
  const formContext = useForm<AddChildCommand>({
    defaultValues: {
      givenName: "",
    },
  });

  const { handleSubmit, setError } = formContext;

  const onSubmit = (data: AddChildCommand) => {
    mutate({ data: data }, { onSuccess: onSuccess, onError: onMutateError });
  };

  const onSuccess = (childId: string) => {
    void queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey({}) });
    navigate(`/children/${childId}`);
  };

  const onMutateError = (error: UnprocessableEntityResponse) => {
    error.errors.forEach((propertyError) => {
      setError(propertyError.property as any, {
        type: "server",
        message: propertyError.title,
      });
    });
  };

  return (
    <Container maxWidth="sm" disableGutters>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
        {t("Add New Child")}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          {t("A unique child identification number will be automatically assigned when you save.")}
        </Alert>
        <Form formContext={formContext} onSubmit={onSubmit}>
          <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="givenName" label={t("Voornaam")} required fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="familyName" label={t("Achternaam")} required fullWidth />
            </Grid>
            <Grid size={12}>
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
            <Grid size={12}>
              <FormTextField name="CID" label={t("CID")} fullWidth />
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate("/children")}>
              {t("Cancel")}
            </Button>
            <Button variant="contained" onClick={handleSubmit(onSubmit)}>
              {t("Save", { ns: "common" })}
            </Button>
          </Box>
        </Form>
      </Paper>
    </Container>
  );
};

export const Component = NewChildPage;
