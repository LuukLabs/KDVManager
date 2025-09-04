import { type AddChildCommand } from "@api/models/addChildCommand";
import { useForm } from "react-hook-form";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { Alert } from "@mui/material";
import { getListChildrenQueryKey, useAddChild } from "@api/endpoints/children/children";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DatePickerElement } from "react-hook-form-mui/date-pickers";
import { type UnprocessableEntityResponse } from "@api/models/unprocessableEntityResponse";

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
    <>
      <div className="t1">{t("Single user Creation")}</div>
      <Paper style={{ padding: 16 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("A unique child identification number will be automatically assigned when you save.")}
        </Alert>
        <FormContainer formContext={formContext} handleSubmit={handleSubmit(onSubmit)}>
          <Grid container alignItems="flex-start" spacing={2}>
            <Grid size={12}>
              <TextFieldElement name="givenName" label={t("Voornaam")} required fullWidth />
            </Grid>
            <Grid size={12}>
              <TextFieldElement name="familyName" label={t("Achternaam")} required fullWidth />
            </Grid>
            <Grid size={12}>
              <DatePickerElement
                label={t("Date of birth")}
                name="dateOfBirth"
                required
                transform={{
                  output: (value) => {
                    return value ? value.format("YYYY-MM-DD") : null;
                  },
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
            <Grid size={12}>
              <TextFieldElement name="CID" label={t("CID")} fullWidth />
            </Grid>
          </Grid>
          <Button onClick={handleSubmit(onSubmit)}>{t("Save", { ns: "common" })}</Button>
        </FormContainer>
      </Paper>
    </>
  );
};

export const Component = NewChildPage;
