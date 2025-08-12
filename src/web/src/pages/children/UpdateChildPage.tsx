import { useForm } from "react-hook-form";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import {
  Grid,
  Button,
  Alert,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  useMediaQuery,
  useTheme,
  Container,
} from "@mui/material";
import {
  Person as PersonIcon,
  Save as SaveIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import {
  getListChildrenQueryKey,
  useUpdateChild,
  useGetChildById,
  getGetChildByIdQueryOptions,
  useArchiveChild,
} from "@api/endpoints/children/children";
import { useParams, useLoaderData } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { type UpdateChildCommand } from "@api/models/updateChildCommand";
import { type UnprocessableEntityResponse } from "@api/models/unprocessableEntityResponse";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { type updateChildPageLoader } from "./updateChildPage.loader";
import { ChildScheduleView } from "../../features/schedules/ChildScheduleView";
import { DatePickerElement } from "react-hook-form-mui/date-pickers";
import { AbsenceList } from "../../features/absence/AbsenceList";
import NiceModal from "@ebay/nice-modal-react";
import { AddAbsenceDialog } from "../../features/absence/AddAbsenceDialog";
import { Add as AddIcon } from "@mui/icons-material";
import { ChildHeader } from "@components/child";

const UpdateChildPage = () => {
  const { childId } = useParams() as { childId: string };
  const loaderData = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof updateChildPageLoader>>
  >;

  const { data: child } = useGetChildById(childId, {
    query: { initialData: loaderData },
  });
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { mutateAsync } = useUpdateChild();
  const { mutateAsync: archiveChildAsync, isPending: isArchiving } = useArchiveChild();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const formContext = useForm<UpdateChildCommand>({
    defaultValues: {
      givenName: child?.givenName ?? "",
      familyName: child?.familyName ?? "",
      dateOfBirth: child?.dateOfBirth ?? "",
      cid: child?.cid ?? "",
    },
  });

  const onAddAbsenceClickHandler = () =>
    void NiceModal.show(AddAbsenceDialog, { childId: childId });

  const {
    handleSubmit,
    reset,
    setError,
    formState: { isValid, isDirty, isSubmitting },
  } = formContext;

  const onSubmit = (data: UpdateChildCommand) => {
    mutateAsync(
      { id: childId, data: data },
      { onSuccess: onMutateSuccess, onError: onMutateError },
    );
  };

  const onMutateSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey({}) });
    void queryClient.invalidateQueries({ queryKey: getGetChildByIdQueryOptions(childId).queryKey });
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

  const archive = () => {
    archiveChildAsync({ id: childId });
                      enqueueSnackbar(t("Child archived"), { variant: "success" });
                      void queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey({}) });
                      void queryClient.invalidateQueries({
                        queryKey: getGetChildByIdQueryOptions(childId).queryKey,
                      });
  }

  if (!childId) {
    return <Alert severity="error">{t("Child ID is required")}</Alert>;
  }

  if (!child) {
    return <Alert severity="warning">{t("Child not found")}</Alert>;
  }

  return (
    <>
      {/* Header Section */}
      <ChildHeader
          firstName={child.givenName}
          lastName={child.familyName}
          dateOfBirth={child.dateOfBirth}
          cid={child.cid || undefined}
          onArchive={archive}
          loading={isArchiving}
        />

          <Grid container spacing={3}>
      {/* Personal Information Section */}
      <Grid size={{ xs: 12, xl: 6 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <PersonIcon color="primary" />
              <Typography variant="h6" component="h2">
                {t("Personal Information")}
              </Typography>
            </Box>

            <FormContainer formContext={formContext} handleSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextFieldElement name="givenName" label={t("First name")} required fullWidth />
                </Grid>
                <Grid size={12}>
                  <TextFieldElement name="familyName" label={t("Family name")} required fullWidth />
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
                  <TextFieldElement
                    name="cid"
                    label={t("CID")}
                    fullWidth
                    helperText={t("Child identification number")}
                  />
                </Grid>
                <Grid size={12}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2 }}>
                    <Button
                      variant="contained"
                      disabled={!isDirty || !isValid}
                      loading={isSubmitting}
                      onClick={handleSubmit(onSubmit)}
                      startIcon={<SaveIcon />}
                    >
                      {t("Save Changes", { ns: "common" })}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </FormContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Schedule Section */}
      <Grid size={{ xs: 12, xl: 6 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <CalendarIcon color="primary" />
              <Typography variant="h6" component="h2">
                {t("Schedule Management")}
              </Typography>
            </Box>

            <ChildScheduleView childId={childId} />
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, xl: 6 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <CalendarIcon color="primary" />
              <Typography variant="h6" component="h2">
                {t("Absence")}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Button
                variant="contained"
                onClick={onAddAbsenceClickHandler}
                startIcon={<AddIcon />}
                size="medium"
              >
                {t("Add Absence")}
              </Button>
            </Box>
            <AbsenceList childId={childId} />
          </CardContent>
        </Card>
      </Grid>
      </Grid>
    </>
  );
};

export const Component = UpdateChildPage;
