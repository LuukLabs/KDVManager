import { Controller, useForm } from "react-hook-form";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  getGetAllChildrenQueryKey,
  useGetChildById,
  useUpdateChild,
} from "@api/endpoints/children/children";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect } from "react";
import { type UpdateChildCommand } from "@api/models/updateChildCommand";

const UpdateChildPage = () => {
  const { childId } = useParams() as { childId: string };
  const queryClient = useQueryClient();
  const { mutate } = useUpdateChild();
  const navigate = useNavigate();

  const { data: child } = useGetChildById(childId);

  const formContext = useForm<UpdateChildCommand>({});

  const { reset } = formContext;

  useEffect(() => {
    if (child) {
      reset({
        givenName: child.givenName,
        familyName: child.familyName,
        dateOfBirth: child.dateOfBirth,
      });
    }
  }, [child, reset]);

  const handleSubmit = formContext.handleSubmit;

  const onSubmit = (data: UpdateChildCommand) => {
    mutate({ id: childId, data: data }, { onSuccess: onSuccess });
  };

  const onSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getGetAllChildrenQueryKey() });
    navigate("/children");
  };

  return (
    <>
      <Paper style={{ padding: 16 }}>
        <FormContainer formContext={formContext} handleSubmit={handleSubmit(onSubmit)}>
          <Grid container alignItems="flex-start" spacing={2}>
            <Grid item xs={12}>
              <TextFieldElement name="givenName" label="Voornaam" required fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextFieldElement name="familyName" label="Achternaam" required fullWidth />
            </Grid>
            <Grid item xs={12}>
              <Controller
                control={formContext.control}
                name="dateOfBirth"
                render={({ field }) => {
                  return (
                    <DatePicker
                      label="Date"
                      value={field.value ? dayjs(field.value) : undefined}
                      defaultValue={field.value ? dayjs(field.value) : undefined}
                      inputRef={field.ref}
                      onChange={(date) => {
                        field.onChange(date);
                      }}
                    />
                  );
                }}
              ></Controller>
            </Grid>
          </Grid>
          <Button onClick={handleSubmit(onSubmit)}>Submit</Button>
        </FormContainer>
      </Paper>
    </>
  );
};

export const Component = UpdateChildPage;
