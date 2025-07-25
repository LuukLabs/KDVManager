import { type AddChildCommand } from "@api/models/addChildCommand";
import { useForm } from "react-hook-form";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { getGetAllChildrenQueryKey, useAddChild } from "@api/endpoints/children/children";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DatePickerElement } from "react-hook-form-mui/date-pickers";

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

  const handleSubmit = formContext.handleSubmit;

  const onSubmit = (data: AddChildCommand) => {
    mutate({ data: data }, { onSuccess: onSuccess });
  };

  const onSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getGetAllChildrenQueryKey() });
    navigate("/children");
  };

  return (
    <>
      <div className="t1">{t("Single user Creation")}</div>
      <Paper style={{ padding: 16 }}>
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
