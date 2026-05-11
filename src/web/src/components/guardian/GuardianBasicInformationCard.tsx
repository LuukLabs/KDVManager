import React from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@mui/material";
import { calculateAge } from "../../utils/calculateAge";
import { formatDate } from "../../utils/formatDate";
import { Person as PersonIcon } from "@mui/icons-material";
import { EditableCard } from "../cards/EditableCard";
import { FieldDisplay, Form, FormTextField, FormDatePicker } from "../forms";
import { type UseFormReturn } from "react-hook-form";

type GuardianBasicInformationCardProps = {
  // View props
  givenName?: string;
  familyName?: string;
  dateOfBirth?: string;
  loading?: boolean;

  // Edit props
  isEditing?: boolean;
  formContext?: UseFormReturn<any>;
  onSave?: () => void;
  onCancel?: () => void;
  onEditToggle?: (editing: boolean) => void;
};

export const GuardianBasicInformationCard: React.FC<GuardianBasicInformationCardProps> = ({
  givenName,
  familyName,
  dateOfBirth,
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
        <FieldDisplay label={t("Given Name")} value={givenName} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay label={t("Family Name")} value={familyName} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label={t("Date of Birth")}
          value={dateOfBirth ? `${formatDate(dateOfBirth)}${ageString}` : ""}
        />
      </Grid>
    </Grid>
  );

  // Edit mode content
  const editContent = formContext ? (
    <Form formContext={formContext}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="givenName" label={t("Given Name")} fullWidth required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="familyName" label={t("Family Name")} fullWidth required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormDatePicker
            name="dateOfBirth"
            label={t("Date of Birth")}
            slotProps={{ textField: { fullWidth: true } }}
            transform={{
              output: (value) => (value ? value.format("YYYY-MM-DD") : null),
            }}
          />
        </Grid>
      </Grid>
    </Form>
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
