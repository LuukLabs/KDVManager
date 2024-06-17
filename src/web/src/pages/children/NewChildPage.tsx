import Container from "@mui/material/Container";
import { CreateChildCommand } from "@api/models/createChildCommand";
import { useForm } from "react-hook-form";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { getGetAllChildrenQueryKey, useCreateChild } from "@api/endpoints/children/children";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const NewChildPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate } = useCreateChild();
  const navigate = useNavigate();
  const formContext = useForm<CreateChildCommand>({
    defaultValues: {
      givenName: "",
    },
  });

  const handleSubmit = formContext.handleSubmit;

  const onSubmit = (data: CreateChildCommand) => {
    mutate({ data: data }, { onSuccess: onSuccess });
  };

  const onSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getGetAllChildrenQueryKey() });
    navigate("/children");
  };

  return (
    <>
      <Container>
        <div className="t1">{t("Single user Creation")}</div>
        <Paper style={{ padding: 16 }}>
          <FormContainer formContext={formContext} handleSubmit={handleSubmit(onSubmit)}>
            <Grid container alignItems="flex-start" spacing={2}>
              <Grid item xs={12}>
                <TextFieldElement name="givenName" label="Voornaam" required fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextFieldElement name="familyName" label="Achternaam" required fullWidth />
              </Grid>
            </Grid>
            <Button onClick={handleSubmit(onSubmit)}>Submit</Button>
          </FormContainer>
        </Paper>
      </Container>
    </>
  );
};

export const Component = NewChildPage;
