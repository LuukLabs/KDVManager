import React from "react";
import Container from "@mui/material/Container";
import { CreateChildCommand } from "../../api/models";
import { useForm } from "react-hook-form";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import CssBaseline from "@mui/material/CssBaseline";
import {
  getGetAllChildrenQueryKey,
  useCreateChild,
} from "../../api/endpoints/children/children";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "react-query";
import MainNavbar from "../../components/MainNavbar";

export const NewChildPage = () => {
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
    queryClient.invalidateQueries(getGetAllChildrenQueryKey());
    navigate("/children");
  };

  return (
    <>
      <Container>
        <div className="t1">Single user Creation</div>
        <CssBaseline />
        <FormContainer
          formContext={formContext}
          handleSubmit={handleSubmit(onSubmit)}
        >
          <Paper style={{ padding: 16 }}>
            <Grid container alignItems="flex-start" spacing={2}>
              <Grid item xs={12}>
                <TextFieldElement
                  name="givenName"
                  label="Voornaam"
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextFieldElement
                  name="familyName"
                  label="Achternaam"
                  required
                  fullWidth
                />
              </Grid>
            </Grid>
          </Paper>
          <Button onClick={handleSubmit(onSubmit)}>Submit</Button>
        </FormContainer>
      </Container>
    </>
  );
};
