import React from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@mui/material";
import { calculateAge } from "@utils/calculateAge";
import { formatDate } from "@utils/formatDate";
import ChildCareRoundedIcon from "@mui/icons-material/ChildCareRounded";
import { EditableCard } from "../cards/EditableCard";
import { FieldDisplay, Form, FormTextField, FormDatePicker } from "../forms";
import { type UseFormReturn } from "react-hook-form";

type BasicInformationCardProps = {
  // View props
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  childNumber?: number;
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
  childNumber,
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
        <FieldDisplay label={t("Child Number")} value={childNumber?.toString()} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay label={t("First Name")} value={firstName} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay label={t("Last Name")} value={lastName} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FieldDisplay
          label={t("Date of Birth")}
          value={dateOfBirth ? `${formatDate(dateOfBirth)}${ageString}` : ""}
        />
      </Grid>
    </Grid>
  );

  // Edit mode content (use correct field names for form)
  const editContent = formContext ? (
    <Form formContext={formContext}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="givenName" label={t("First Name")} fullWidth required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="familyName" label={t("Last Name")} fullWidth required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormDatePicker
            name="dateOfBirth"
            label={t("Date of Birth")}
            slotProps={{ textField: { fullWidth: true } }}
            transform={{
              output: (value) => (value ? value.format("YYYY-MM-DD") : null),
            }}
            required
          />
        </Grid>
      </Grid>
    </Form>
  ) : null;

  return (
    <EditableCard
      title={t("Basic Information")}
      description={t("Name, date of birth and identification.")}
      icon={<ChildCareRoundedIcon />}
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
