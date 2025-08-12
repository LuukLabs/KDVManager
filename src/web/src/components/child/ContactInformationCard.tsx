import React from "react";
import { Grid } from "@mui/material";
import { ContactPhone as ContactIcon } from "@mui/icons-material";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import { EditableCard } from "../cards/EditableCard";
import { FieldDisplay } from "../forms/FieldDisplay";
import { UseFormReturn } from "react-hook-form";

interface ContactInformationCardProps {
  // View props
  address?: string;
  city?: string;
  postalCode?: string;
  phoneNumber?: string;
  emailAddress?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  loading?: boolean;
  
  // Edit props
  isEditing?: boolean;
  formContext?: UseFormReturn<any>;
  onSave?: () => void;
  onCancel?: () => void;
  onEditToggle?: (editing: boolean) => void;
}

export const ContactInformationCard: React.FC<ContactInformationCardProps> = ({
  address,
  city,
  postalCode,
  phoneNumber,
  emailAddress,
  parentName,
  parentPhone,
  parentEmail,
  loading = false,
  isEditing = false,
  formContext,
  onSave,
  onCancel,
  onEditToggle,
}) => {
  const viewContent = (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <FieldDisplay
          label="Address"
          value={address}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="City"
          value={city}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="Postal Code"
          value={postalCode}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="Phone Number"
          value={phoneNumber}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="Email Address"
          value={emailAddress}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="Parent/Guardian"
          value={parentName}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="Parent Phone"
          value={parentPhone}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FieldDisplay
          label="Parent Email"
          value={parentEmail}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
    </Grid>
  );

  const editContent = formContext ? (
    <FormContainer formContext={formContext}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <TextFieldElement
            name="address"
            label="Address"
            fullWidth
            size="small"
            helperText="Street address"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="city"
            label="City"
            fullWidth
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="postalCode"
            label="Postal Code"
            fullWidth
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="phoneNumber"
            label="Phone Number"
            fullWidth
            size="small"
            type="tel"
            helperText="Primary contact number"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="emailAddress"
            label="Email Address"
            fullWidth
            size="small"
            type="email"
            helperText="Primary email address"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="parentName"
            label="Parent/Guardian"
            fullWidth
            size="small"
            helperText="Primary parent or guardian name"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="parentPhone"
            label="Parent Phone"
            fullWidth
            size="small"
            type="tel"
            helperText="Parent contact number"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextFieldElement
            name="parentEmail"
            label="Parent Email"
            fullWidth
            size="small"
            type="email"
            helperText="Parent email address"
          />
        </Grid>
      </Grid>
    </FormContainer>
  ) : null;

  return (
    <EditableCard
      title="Contact Information"
      icon={<ContactIcon color="primary" />}
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
