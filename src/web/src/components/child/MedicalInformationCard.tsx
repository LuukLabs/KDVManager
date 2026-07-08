import React from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@mui/material";
import MedicalInformationRoundedIcon from "@mui/icons-material/MedicalInformationRounded";
import { EditableCard } from "../cards/EditableCard";
import { FieldDisplay, Form, FormTextField } from "../forms";
import { type UseFormReturn } from "react-hook-form";

type MedicalInformationCardProps = {
  // View props
  allergies?: string | null;
  medication?: string | null;
  dietaryRequirements?: string | null;
  medicalNotes?: string | null;
  loading?: boolean;

  // Edit props
  isEditing?: boolean;
  formContext?: UseFormReturn<any>;
  onSave?: () => void;
  onCancel?: () => void;
  onEditToggle?: (editing: boolean) => void;
};

export const MedicalInformationCard: React.FC<MedicalInformationCardProps> = ({
  allergies,
  medication,
  dietaryRequirements,
  medicalNotes,
  loading,
  isEditing,
  formContext,
  onSave,
  onCancel,
  onEditToggle,
}) => {
  const { t } = useTranslation();

  // View mode content
  const viewContent = (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay label={t("Allergies")} value={allergies} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay label={t("Dietary Requirements")} value={dietaryRequirements} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay label={t("Medication")} value={medication} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FieldDisplay label={t("Medical Notes")} value={medicalNotes} />
      </Grid>
    </Grid>
  );

  // Edit mode content
  const editContent = formContext ? (
    <Form formContext={formContext}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="allergies" label={t("Allergies")} fullWidth multiline minRows={2} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            name="dietaryRequirements"
            label={t("Dietary Requirements")}
            fullWidth
            multiline
            minRows={2}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            name="medication"
            label={t("Medication")}
            fullWidth
            multiline
            minRows={2}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormTextField
            name="medicalNotes"
            label={t("Medical Notes")}
            fullWidth
            multiline
            minRows={3}
          />
        </Grid>
      </Grid>
    </Form>
  ) : null;

  return (
    <EditableCard
      title={t("Medical Information")}
      description={t("Allergies, dietary needs, medication and other extra information.")}
      icon={<MedicalInformationRoundedIcon />}
      isEditing={isEditing}
      onSave={onSave}
      onCancel={onCancel}
      onEditToggle={onEditToggle}
      loading={loading}
    >
      {isEditing ? editContent : viewContent}
    </EditableCard>
  );
};
