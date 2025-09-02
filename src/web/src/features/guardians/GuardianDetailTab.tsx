import { useState } from "react";
import { Grid, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

import {
  useUpdateGuardian,
  getListGuardiansQueryKey,
  getGetGuardianByIdQueryOptions,
} from "@api/endpoints/guardians/guardians";
import { type GuardianDetailVM } from "@api/models/guardianDetailVM";
import { type UnprocessableEntityResponse } from "@api/models/unprocessableEntityResponse";

import { GuardianBasicInformationCard } from "../../components/guardian/GuardianBasicInformationCard";
import { GuardianContactInformationCard } from "../../components/guardian/GuardianContactInformationCard";
import { GuardianChildrenCard } from "../../components/guardian/GuardianChildrenCard";

type GuardianDetailTabProps = {
  guardian: GuardianDetailVM;
};

type UpdateGuardianFormData = {
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

export const GuardianDetailTab: React.FC<GuardianDetailTabProps> = ({ guardian }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { mutateAsync: updateGuardian } = useUpdateGuardian();

  const SECTION_BASIC = "basic";
  const SECTION_CONTACT = "contact";

  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({
    [SECTION_BASIC]: false,
    [SECTION_CONTACT]: false,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form for basic information
  const basicFormContext = useForm<UpdateGuardianFormData>({
    defaultValues: {
      givenName: guardian.givenName ?? "",
      familyName: guardian.familyName ?? "",
      dateOfBirth: guardian.dateOfBirth ?? "",
      email: guardian.email ?? "",
      phoneNumbers: (guardian.phoneNumbers ?? []).map((p) => ({
        id: p.id,
        number: p.number ?? "",
        type: p.type ?? "Mobile",
      })),
    },
  });

  // Form for contact information
  const contactFormContext = useForm<UpdateGuardianFormData>({
    defaultValues: {
      givenName: guardian.givenName ?? "",
      familyName: guardian.familyName ?? "",
      dateOfBirth: guardian.dateOfBirth ?? "",
      email: guardian.email ?? "",
      phoneNumbers: (guardian.phoneNumbers ?? []).map((p) => ({
        id: p.id,
        number: p.number ?? "",
        type: p.type ?? "Mobile",
      })),
    },
  });

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

      if (!guardian.id) {
        throw new Error(
          t("guardian.errors.idRequired", { defaultValue: "Guardian ID is required" }),
        );
      }

      await updateGuardian({
        id: guardian.id,
        data: {
          id: guardian.id,
          givenName: data.givenName,
          familyName: data.familyName,
          dateOfBirth: data.dateOfBirth ?? "",
          email: guardian.email ?? "",
          phoneNumbers:
            guardian.phoneNumbers?.map((p) => ({
              id: p.id,
              number: p.number ?? "",
              type: p.type ?? "Mobile",
            })) ?? [],
        },
      });

      // Update cache and show success
      await queryClient.invalidateQueries({
        queryKey: getListGuardiansQueryKey({ pageNumber: 1, pageSize: 10 }),
      });
      await queryClient.invalidateQueries({
        queryKey: getGetGuardianByIdQueryOptions(guardian.id).queryKey,
      });

      enqueueSnackbar(
        t("guardian.success.basicUpdated", "Basic information updated successfully"),
        { variant: "success" },
      );
      handleSectionEdit(SECTION_BASIC, false);
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
        setSubmitError(
          t("guardian.errors.updateBasicFailed", {
            defaultValue: "Failed to update basic information. Please try again.",
          }),
        );
      }
    }
  };

  const handleContactSave = async () => {
    try {
      setSubmitError(null);
      const data = contactFormContext.getValues();

      if (!guardian.id) {
        throw new Error(
          t("guardian.errors.idRequired", { defaultValue: "Guardian ID is required" }),
        );
      }

      await updateGuardian({
        id: guardian.id,
        data: {
          id: guardian.id,
          givenName: guardian.givenName ?? "",
          familyName: guardian.familyName ?? "",
          dateOfBirth: guardian.dateOfBirth ?? "",
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
        queryKey: getGetGuardianByIdQueryOptions(guardian.id).queryKey,
      });

      enqueueSnackbar(
        t("guardian.success.contactUpdated", "Contact information updated successfully"),
        { variant: "success" },
      );
      handleSectionEdit(SECTION_CONTACT, false);
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
        setSubmitError(
          t("guardian.errors.updateContactFailed", {
            defaultValue: "Failed to update contact information. Please try again.",
          }),
        );
      }
    }
  };

  const handleCancel = (section: string) => {
    if (section === SECTION_BASIC) {
      basicFormContext.reset();
    } else if (section === SECTION_CONTACT) {
      contactFormContext.reset();
    }
    handleSectionEdit(section, false);
    setSubmitError(null);
  };

  return (
    <>
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
            givenName={guardian.givenName}
            familyName={guardian.familyName}
            dateOfBirth={guardian.dateOfBirth ?? undefined}
            isEditing={editingSections.basic}
            formContext={basicFormContext}
            onSave={handleBasicSave}
            onCancel={() => handleCancel(SECTION_BASIC)}
            onEditToggle={(editing) => handleSectionEdit(SECTION_BASIC, editing)}
          />
        </Grid>

        {/* Contact Information */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <GuardianContactInformationCard
            email={guardian.email ?? undefined}
            phoneNumbers={
              guardian.phoneNumbers?.map((p) => ({
                id: p.id,
                number: p.number ?? "",
                type: p.type ?? "Mobile",
              })) ?? []
            }
            isEditing={editingSections[SECTION_CONTACT]}
            formContext={contactFormContext}
            onSave={handleContactSave}
            onCancel={() => handleCancel(SECTION_CONTACT)}
            onEditToggle={(editing) => handleSectionEdit(SECTION_CONTACT, editing)}
          />
        </Grid>

        {/* Children Information */}
        <Grid size={{ xs: 12 }}>
          {guardian.id && <GuardianChildrenCard guardianId={guardian.id} />}
        </Grid>
      </Grid>
    </>
  );
};
