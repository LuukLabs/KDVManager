import { Controller, useForm } from "react-hook-form";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  getGetAllChildrenQueryKey,
  useGetChildById,
  useUpdateChild,
} from "@api/endpoints/children/children";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect } from "react";
import { type UpdateChildCommand } from "@api/models/updateChildCommand";
import { type UnprocessableEntityResponse } from "@api/models/unprocessableEntityResponse";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import LoadingButton from "@mui/lab/LoadingButton/LoadingButton";

const UpdateChildPage = () => {
  const { childId } = useParams() as { childId: string };
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { mutateAsync } = useUpdateChild();

  const { data: child } = useGetChildById(childId);

  const formContext = useForm<UpdateChildCommand>({});

  const {
    handleSubmit,
    reset,
    setError,
    formState: { isValid, isDirty, isSubmitting },
  } = formContext;

  useEffect(() => {
    if (child) {
      reset({
        givenName: child.givenName,
        familyName: child.familyName,
        dateOfBirth: child.dateOfBirth,
      });
    }
  }, [child, reset]);

  const onSubmit = (data: UpdateChildCommand) => {
    mutateAsync(
      { id: childId, data: data },
      { onSuccess: onMutateSuccess, onError: onMutateError },
    );
  };

  const onMutateSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getGetAllChildrenQueryKey() });
    enqueueSnackbar(t("Child updated"), { variant: "success" });
    reset({}, { keepValues: true });
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
            <Grid item xs={12}>
              <LoadingButton
                variant="contained"
                disabled={!isDirty || !isValid}
                loading={isSubmitting}
                onClick={handleSubmit(onSubmit)}
              >
                <span>{t("Save")}</span>
              </LoadingButton>
            </Grid>
          </Grid>
        </FormContainer>
      </Paper>
    </>
  );
};

export const Component = UpdateChildPage;
