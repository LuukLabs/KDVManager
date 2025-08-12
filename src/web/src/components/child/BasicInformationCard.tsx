import React from "react";
import { Grid } from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import { DatePickerElement } from "react-hook-form-mui/date-pickers";
import { EditableCard } from "../cards/EditableCard";
import { FieldDisplay } from "../forms/FieldDisplay";
import { UseFormReturn } from "react-hook-form";

interface BasicInformationCardProps {
  // View props
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  cid?: string;
  loading?: boolean;
  
  // Edit props
  isEditing?: boolean;
  formContext?: UseFormReturn<any>;
  onSave?: () => void;
  onCancel?: () => void;
  onEditToggle?: (editing: boolean) => void;
}

export const BasicInformationCard: React.FC<BasicInformationCardProps> = ({
  firstName,
  lastName,
  dateOfBirth,
  cid,
  loading = false,
  isEditing = false,
  formContext,
  onSave,
  onCancel,
  onEditToggle,
}) => {

  const formatDate = (dateString?: string) => {
    if (!dateString) return undefined;
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const viewContent = (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="First Name"
          value={firstName}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="Last Name"
          value={lastName}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="Date of Birth"
          value={formatDate(dateOfBirth)}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="CID"
          value={cid}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
    </Grid>
  );

  const editContent = formContext ? (
    <FormContainer formContext={formContext}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="givenName"
            label="First Name"
            required
            fullWidth
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="familyName"
            label="Last Name"
            required
            fullWidth
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DatePickerElement
            label="Date of Birth"
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
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="cid"
            label="CID"
            fullWidth
            size="small"
            helperText="Child identification number"
          />
        </Grid>
      </Grid>
    </FormContainer>
  ) : null;

  return (
    <EditableCard
      title="Basic Information"
      icon={<PersonIcon color="primary" />}
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
