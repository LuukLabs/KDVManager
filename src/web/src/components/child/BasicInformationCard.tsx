import React from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@mui/material";
import { calculateAge } from "../../utils/calculateAge";
import { Person as PersonIcon } from "@mui/icons-material";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import { DatePickerElement } from "react-hook-form-mui/date-pickers";
import { EditableCard } from "../cards/EditableCard";
import { FieldDisplay } from "../forms/FieldDisplay";
import { type UseFormReturn } from "react-hook-form";

type BasicInformationCardProps = {
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
};

export const BasicInformationCard: React.FC<BasicInformationCardProps> = ({
  firstName,
  lastName,
  dateOfBirth,
  cid,
  loading,
  isEditing,
  formContext,
  onSave,
  onCancel,
  onEditToggle,
}) => {
  const { t } = useTranslation();

  // Calculate age if dateOfBirth is present
  const age = calculateAge(dateOfBirth ?? "");
  const ageString = age !== undefined && age !== null ? ` (${age} ${t("years")})` : "";

  // View mode content
  const viewContent = (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay label={t("First Name")} value={firstName} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay label={t("Last Name")} value={lastName} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label={t("Date of Birth")}
          value={dateOfBirth ? `${dateOfBirth}${ageString}` : ""}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay label={t("CID")} value={cid} />
      </Grid>
    </Grid>
  );

  // Edit mode content (use correct field names for form)
  const editContent = formContext ? (
    <FormContainer formContext={formContext}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement name="givenName" label={t("First Name")} fullWidth required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement name="familyName" label={t("Last Name")} fullWidth required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DatePickerElement
            name="dateOfBirth"
            label={t("Date of Birth")}
            inputProps={{ fullWidth: true }}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="cid"
            label={t("CID")}
            fullWidth
            size="small"
            helperText={t("Child identification number")}
          />
        </Grid>
      </Grid>
    </FormContainer>
  ) : null;

  return (
    <EditableCard
      title={t("Basic Information")}
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
