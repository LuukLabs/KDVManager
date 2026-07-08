import { useState } from "react";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

import {
  useUpdateChild,
  getListChildrenQueryKey,
  getGetChildByIdQueryOptions,
} from "@api/crm/endpoints/children/children";
import { type UpdateChildCommand } from "@api/crm/models/updateChildCommand";
import { type ChildDetailVM } from "@api/crm/models/childDetailVM";
import { FormErrorAlert, applyServerValidationErrors } from "@components/forms";

import { ChildGuardiansCard } from "../../../features/guardians/ChildGuardiansCard";
import { BasicInformationCard } from "@components/child/BasicInformationCard";
import { MedicalInformationCard } from "@components/child/MedicalInformationCard";

type GeneralInformationTabProps = {
  child: ChildDetailVM;
};

export const GeneralInformationTab: React.FC<GeneralInformationTabProps> = ({ child }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { mutateAsync: updateChild } = useUpdateChild();

  const SECTION_BASIC = "basic";
  const SECTION_MEDICAL = "medical";
  const SECTION_CONTACT = "contact";

  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({
    [SECTION_BASIC]: false,
    [SECTION_MEDICAL]: false,
    [SECTION_CONTACT]: false,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form for basic information (connected to API)
  const basicFormContext = useForm<UpdateChildCommand>({
    defaultValues: {
      id: child.id,
      givenName: child.givenName ?? "",
      familyName: child.familyName ?? "",
      dateOfBirth: child.dateOfBirth ?? "",
    },
  });

  // Form for medical / extra information (connected to API)
  const medicalFormContext = useForm({
    defaultValues: {
      allergies: child.allergies ?? "",
      medication: child.medication ?? "",
      dietaryRequirements: child.dietaryRequirements ?? "",
      medicalNotes: child.medicalNotes ?? "",
    },
  });

  // The update endpoint is a full replace, so every save must carry the
  // fields owned by the other cards to avoid clearing them.
  const buildBaseCommand = (): UpdateChildCommand => ({
    id: child.id!,
    givenName: child.givenName ?? "",
    familyName: child.familyName ?? "",
    dateOfBirth: child.dateOfBirth ?? "",
    allergies: child.allergies,
    medication: child.medication,
    dietaryRequirements: child.dietaryRequirements,
    medicalNotes: child.medicalNotes,
  });

  const invalidateChildQueries = async () => {
    if (!child.id) return;
    await queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey({}) });
    await queryClient.invalidateQueries({
      queryKey: getGetChildByIdQueryOptions(child.id).queryKey,
    });
  };

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

      if (!child.id) {
        throw new Error(t("child.errors.idRequired", { defaultValue: "Child ID is required" }));
      }

      await updateChild({
        id: child.id,
        data: {
          ...buildBaseCommand(),
          givenName: data.givenName,
          familyName: data.familyName,
          dateOfBirth: data.dateOfBirth,
        },
      });

      // Update cache and show success
      await invalidateChildQueries();

      enqueueSnackbar(t("child.success.basicUpdated", "Basic information updated successfully"), {
        variant: "success",
      });
      handleSectionEdit(SECTION_BASIC, false);
    } catch (error) {
      const mapped = applyServerValidationErrors(error, basicFormContext.setError, {
        fields: ["givenName", "familyName", "dateOfBirth"],
      });
      if (!mapped) {
        setSubmitError(
          t("child.errors.updateBasicFailed", {
            defaultValue: "Failed to update basic information. Please try again.",
          }),
        );
      }
    }
  };

  const handleMedicalSave = async () => {
    try {
      setSubmitError(null);
      const data = medicalFormContext.getValues();

      if (!child.id) {
        throw new Error(t("child.errors.idRequired", { defaultValue: "Child ID is required" }));
      }

      await updateChild({
        id: child.id,
        data: {
          ...buildBaseCommand(),
          allergies: data.allergies,
          medication: data.medication,
          dietaryRequirements: data.dietaryRequirements,
          medicalNotes: data.medicalNotes,
        },
      });

      await invalidateChildQueries();

      enqueueSnackbar(
        t("child.success.medicalUpdated", "Medical information updated successfully"),
        { variant: "success" },
      );
      handleSectionEdit(SECTION_MEDICAL, false);
    } catch (error) {
      const mapped = applyServerValidationErrors(error, medicalFormContext.setError, {
        fields: ["allergies", "medication", "dietaryRequirements", "medicalNotes"],
      });
      if (!mapped) {
        setSubmitError(
          t("child.errors.updateMedicalFailed", {
            defaultValue: "Failed to update medical information. Please try again.",
          }),
        );
      }
    }
  };

  const handleCancel = (section: string) => {
    if (section === SECTION_BASIC) {
      basicFormContext.reset();
    } else if (section === SECTION_MEDICAL) {
      medicalFormContext.reset();
    }
    handleSectionEdit(section, false);
    setSubmitError(null);
  };

  return (
    <>
      <FormErrorAlert message={submitError} onClose={() => setSubmitError(null)} sx={{ mb: 3 }} />

      {/* Information Cards */}
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <BasicInformationCard
            firstName={child.givenName}
            lastName={child.familyName}
            dateOfBirth={child.dateOfBirth}
            childNumber={child.childNumber}
            isEditing={editingSections.basic}
            formContext={basicFormContext}
            onSave={handleBasicSave}
            onCancel={() => handleCancel(SECTION_BASIC)}
            onEditToggle={(editing) => handleSectionEdit(SECTION_BASIC, editing)}
          />
        </Grid>

        {/* Guardians Information. On mobile the cards stack in one column, so
            order guardians last (after medical); on lg it keeps its spot in the
            right column beside basic information. */}
        <Grid size={{ xs: 12, lg: 6 }} sx={{ order: { xs: 3, lg: 2 } }}>
          {child.id && <ChildGuardiansCard childId={child.id} />}
        </Grid>

        {/* Medical / Extra Information */}
        <Grid size={{ xs: 12, lg: 6 }} sx={{ order: { xs: 2, lg: 3 } }}>
          <MedicalInformationCard
            allergies={child.allergies}
            medication={child.medication}
            dietaryRequirements={child.dietaryRequirements}
            medicalNotes={child.medicalNotes}
            isEditing={editingSections.medical}
            formContext={medicalFormContext}
            onSave={handleMedicalSave}
            onCancel={() => handleCancel(SECTION_MEDICAL)}
            onEditToggle={(editing) => handleSectionEdit(SECTION_MEDICAL, editing)}
          />
        </Grid>
      </Grid>
    </>
  );
};
