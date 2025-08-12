import React from "react";
import { Grid } from "@mui/material";
import { MedicalServices as MedicalIcon } from "@mui/icons-material";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import { EditableCard } from "../cards/EditableCard";
import { FieldDisplay } from "../forms/FieldDisplay";
import { UseFormReturn } from "react-hook-form";

interface MedicalInformationCardProps {
  // View props
  allergies?: string;
  medication?: string;
  medicalNotes?: string;
  dietaryRequirements?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  doctorName?: string;
  doctorPhone?: string;
  loading?: boolean;
  
  // Edit props
  isEditing?: boolean;
  formContext?: UseFormReturn<any>;
  onSave?: () => void;
  onCancel?: () => void;
  onEditToggle?: (editing: boolean) => void;
}

export const MedicalInformationCard: React.FC<MedicalInformationCardProps> = ({
  allergies,
  medication,
  medicalNotes,
  dietaryRequirements,
  emergencyContact,
  emergencyPhone,
  doctorName,
  doctorPhone,
  loading = false,
  isEditing = false,
  formContext,
  onSave,
  onCancel,
  onEditToggle,
}) => {
  const viewContent = (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="Allergies"
          value={allergies}
          loading={loading}
          placeholder="No known allergies"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="Current Medication"
          value={medication}
          loading={loading}
          placeholder="No current medication"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="Emergency Contact"
          value={emergencyContact}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="Emergency Phone"
          value={emergencyPhone}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="Doctor"
          value={doctorName}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="Doctor Phone"
          value={doctorPhone}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FieldDisplay
          label="Dietary Requirements"
          value={dietaryRequirements}
          loading={loading}
          placeholder="No special dietary requirements"
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FieldDisplay
          label="Medical Notes"
          value={medicalNotes}
          loading={loading}
          placeholder="No additional medical notes"
        />
      </Grid>
    </Grid>
  );

  const editContent = formContext ? (
    <FormContainer formContext={formContext}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="allergies"
            label="Allergies"
            fullWidth
            size="small"
            multiline
            rows={2}
            helperText="List any known allergies"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="medication"
            label="Current Medication"
            fullWidth
            size="small"
            multiline
            rows={2}
            helperText="List current medications and dosage"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="emergencyContact"
            label="Emergency Contact"
            fullWidth
            size="small"
            helperText="Primary emergency contact person"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="emergencyPhone"
            label="Emergency Phone"
            fullWidth
            size="small"
            helperText="Emergency contact phone number"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="doctorName"
            label="Doctor"
            fullWidth
            size="small"
            helperText="Primary care physician"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="doctorPhone"
            label="Doctor Phone"
            fullWidth
            size="small"
            helperText="Doctor's contact number"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextFieldElement
            name="dietaryRequirements"
            label="Dietary Requirements"
            fullWidth
            size="small"
            multiline
            rows={2}
            helperText="Special dietary needs or restrictions"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextFieldElement
            name="medicalNotes"
            label="Medical Notes"
            fullWidth
            size="small"
            multiline
            rows={3}
            helperText="Additional medical information"
          />
        </Grid>
      </Grid>
    </FormContainer>
  ) : null;

  return (
    <EditableCard
      title="Medical Information"
      icon={<MedicalIcon color="primary" />}
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
