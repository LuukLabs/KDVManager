import { AddGroupCommand } from "@api/models";
import { useForm } from "react-hook-form";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getListGroupsQueryKey, useAddGroup } from "@api/endpoints/groups/groups";

export const AddGroupForm = () => {
  const queryClient = useQueryClient();
  const { mutate } = useAddGroup();
  const navigate = useNavigate();
  const formContext = useForm<AddGroupCommand>();

  const handleSubmit = formContext.handleSubmit;

  const onSubmit = (data: AddGroupCommand) => {
    mutate({ data: data }, { onSuccess: onSuccess });
  };

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
    navigate("/groups");
  };

  return (
    <FormContainer formContext={formContext} handleSubmit={handleSubmit(onSubmit)}>
      <Paper style={{ padding: 16 }}>
        <Grid container alignItems="flex-start" spacing={2}>
          <Grid item xs={12}>
            <TextFieldElement name="name" label="Naam" required fullWidth />
          </Grid>
        </Grid>
      </Paper>
      <Button onClick={handleSubmit(onSubmit)}>Submit</Button>
    </FormContainer>
  );
};
