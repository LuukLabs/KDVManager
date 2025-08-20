import { Box, Container, Alert, Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
  useGetGuardianById,
  useUpdateGuardian,
  getListGuardiansQueryKey,
  getGetGuardianByIdQueryOptions,
} from "@api/endpoints/guardians/guardians";
import { useTranslation } from "react-i18next";
import { GuardianHeader } from "../../components/guardian/GuardianHeader";
import { GuardianBasicInformationCard } from "../../components/guardian/GuardianBasicInformationCard";
import { GuardianContactInformationCard } from "../../components/guardian/GuardianContactInformationCard";
import { type UnprocessableEntityResponse } from "@api/models/unprocessableEntityResponse";

type GuardianFormData = {
  givenName: string;
  familyName: string;
  dateOfBirth?: string;
  email: string;
  phoneNumbers: {
    id?: string;
    number: string;
    type: "Mobile" | "Home" | "Work" | "Other";
  }[];
};

const EditGuardianPage = () => {
  const { guardianId } = useParams<{ guardianId: string }>();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { data: guardian, isLoading, error } = useGetGuardianById(guardianId!);
  const updateGuardian = useUpdateGuardian();

  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({
    basic: false,
    contact: false,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form for basic information
  const basicFormContext = useForm<GuardianFormData>({
    defaultValues: {
      givenName: guardian?.givenName ?? "",
      familyName: guardian?.familyName ?? "",
      dateOfBirth: guardian?.dateOfBirth ?? "",
      email: guardian?.email ?? "",
      phoneNumbers: (guardian?.phoneNumbers ?? []).map((p) => ({
        id: p.id,
        number: p.number ?? "",
        type: p.type ?? "Mobile",
      })),
    },
  });

  // Form for contact information
  const contactFormContext = useForm<GuardianFormData>({
    defaultValues: {
      givenName: guardian?.givenName ?? "",
      familyName: guardian?.familyName ?? "",
      dateOfBirth: guardian?.dateOfBirth ?? "",
      email: guardian?.email ?? "",
      phoneNumbers: (guardian?.phoneNumbers ?? []).map((p) => ({
        id: p.id,
        number: p.number ?? "",
        type: p.type ?? "Mobile",
      })),
    },
  });

  // Reset forms when guardian data loads
  useEffect(() => {
    if (guardian) {
      const defaultData: GuardianFormData = {
        givenName: guardian.givenName ?? "",
        familyName: guardian.familyName ?? "",
        dateOfBirth: guardian.dateOfBirth ?? "",
        email: guardian.email ?? "",
        phoneNumbers: (guardian.phoneNumbers ?? []).map((p) => ({
          id: p.id,
          number: p.number ?? "",
          type: p.type ?? "Mobile",
        })),
      };
      basicFormContext.reset(defaultData);
      contactFormContext.reset(defaultData);
    }
  }, [guardian, basicFormContext, contactFormContext]);

  const handleSectionEdit = (section: string, isEditing: boolean) => {
    setEditingSections((prev) => ({
      ...prev,
      [section]: isEditing,
    }));
    setSubmitError(null);
  };

  const handleBasicSave = async () => {
    try {
      setSubmitError(null);
      const data = basicFormContext.getValues();

      if (!guardianId) {
        throw new Error("Guardian ID is required");
      }

      await updateGuardian.mutateAsync({
        id: guardianId,
        data: {
          id: guardianId,
          givenName: data.givenName,
          familyName: data.familyName,
          dateOfBirth: data.dateOfBirth ?? "",
          email: guardian?.email ?? "",
          phoneNumbers: (guardian?.phoneNumbers ?? []).map((p) => ({
            id: p.id,
            number: p.number ?? "",
            type: p.type ?? "Mobile",
          })),
        },
      });

      // Update cache and show success
      await queryClient.invalidateQueries({
        queryKey: getListGuardiansQueryKey({ pageNumber: 1, pageSize: 10 }),
      });
      await queryClient.invalidateQueries({
        queryKey: getGetGuardianByIdQueryOptions(guardianId).queryKey,
      });

      enqueueSnackbar(t("Basic information updated successfully"), { variant: "success" });
      handleSectionEdit("basic", false);
    } catch (error) {
      if (error && typeof error === "object" && "errors" in error) {
        const validationError = error as UnprocessableEntityResponse;
        validationError.errors.forEach((propertyError) => {
          basicFormContext.setError(propertyError.property as any, {
            type: "server",
            message: propertyError.title,
          });
        });
      } else {
        setSubmitError("Failed to update basic information. Please try again.");
      }
    }
  };

  const handleContactSave = async () => {
    try {
      setSubmitError(null);
      const data = contactFormContext.getValues();

      if (!guardianId) {
        throw new Error("Guardian ID is required");
      }

      await updateGuardian.mutateAsync({
        id: guardianId,
        data: {
          id: guardianId,
          givenName: guardian?.givenName ?? "",
          familyName: guardian?.familyName ?? "",
          dateOfBirth: guardian?.dateOfBirth ?? "",
          email: data.email,
          phoneNumbers: data.phoneNumbers.map((p) => ({
            id: p.id,
            number: p.number,
            type: p.type,
          })),
        },
      });

      // Update cache and show success
      await queryClient.invalidateQueries({
        queryKey: getListGuardiansQueryKey({ pageNumber: 1, pageSize: 10 }),
      });
      await queryClient.invalidateQueries({
        queryKey: getGetGuardianByIdQueryOptions(guardianId).queryKey,
      });

      enqueueSnackbar(t("Contact information updated successfully"), { variant: "success" });
      handleSectionEdit("contact", false);
    } catch (error) {
      if (error && typeof error === "object" && "errors" in error) {
        const validationError = error as UnprocessableEntityResponse;
        validationError.errors.forEach((propertyError) => {
          contactFormContext.setError(propertyError.property as any, {
            type: "server",
            message: propertyError.title,
          });
        });
      } else {
        setSubmitError("Failed to update contact information. Please try again.");
      }
    }
  };

  const handleCancel = (section: string) => {
    if (section === "basic") {
      basicFormContext.reset();
    } else if (section === "contact") {
      contactFormContext.reset();
    }
    handleSectionEdit(section, false);
    setSubmitError(null);
  };

  if (!guardianId) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">{t("Guardian ID is required")}</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">{t("Guardian not found")}</Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        pb: { xs: 8, md: 6 },
      }}
    >
      {/* Edge-to-edge header similar to child page */}
      <Box sx={{ mb: { xs: 1, md: 2 }, mx: { xs: -2, md: 0 } }}>
        <GuardianHeader
          givenName={guardian?.givenName}
          familyName={guardian?.familyName}
          email={guardian?.email ?? undefined}
          phone={guardian?.phoneNumbers?.[0]?.number ?? undefined}
          loading={isLoading}
        />
      </Box>

      <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2, md: 0 } }}>
        {/* Error Alert */}
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}

        {/* Information Cards */}
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <GuardianBasicInformationCard
              givenName={guardian?.givenName}
              familyName={guardian?.familyName}
              dateOfBirth={guardian?.dateOfBirth ?? undefined}
              isEditing={editingSections.basic}
              formContext={basicFormContext}
              onSave={handleBasicSave}
              onCancel={() => handleCancel("basic")}
              onEditToggle={(editing) => handleSectionEdit("basic", editing)}
              loading={isLoading || updateGuardian.isPending}
            />
          </Grid>

          {/* Contact Information */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <GuardianContactInformationCard
              email={guardian?.email ?? undefined}
              phoneNumbers={
                guardian?.phoneNumbers?.map((p) => ({
                  id: p.id,
                  number: p.number ?? "",
                  type: p.type ?? "Mobile",
                })) ?? []
              }
              isEditing={editingSections.contact}
              formContext={contactFormContext}
              onSave={handleContactSave}
              onCancel={() => handleCancel("contact")}
              onEditToggle={(editing) => handleSectionEdit("contact", editing)}
              loading={isLoading || updateGuardian.isPending}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export const Component = EditGuardianPage;
