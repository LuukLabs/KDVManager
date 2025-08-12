import React from "react";
import { Grid, Box } from "@mui/material";
import { Schedule as ScheduleIcon } from "@mui/icons-material";
import { FormContainer, TextFieldElement, SelectElement, CheckboxElement } from "react-hook-form-mui";
import { EditableCard } from "../cards/EditableCard";
import { FieldDisplay } from "../forms/FieldDisplay";
import { UseFormReturn } from "react-hook-form";

interface ScheduleInformationCardProps {
  // View props
  startDate?: string;
  endDate?: string;
  daysPerWeek?: number;
  preferredDays?: string[];
  startTime?: string;
  endTime?: string;
  notes?: string;
  loading?: boolean;
  
  // Edit props
  isEditing?: boolean;
  formContext?: UseFormReturn<any>;
  onSave?: () => void;
  onCancel?: () => void;
  onEditToggle?: (editing: boolean) => void;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
];

export const ScheduleInformationCard: React.FC<ScheduleInformationCardProps> = ({
  startDate,
  endDate,
  daysPerWeek,
  preferredDays = [],
  startTime,
  endTime,
  notes,
  loading = false,
  isEditing = false,
  formContext,
  onSave,
  onCancel,
  onEditToggle,
}) => {
  const formatDays = (days: string[]) => {
    if (!days || days.length === 0) return "Not specified";
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(", ");
  };

  const viewContent = (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="Start Date"
          value={startDate}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="End Date"
          value={endDate}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="Days Per Week"
          value={daysPerWeek?.toString()}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="Preferred Days"
          value={formatDays(preferredDays)}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="Start Time"
          value={startTime}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FieldDisplay
          label="End Time"
          value={endTime}
          loading={loading}
          placeholder="Not specified"
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FieldDisplay
          label="Schedule Notes"
          value={notes}
          loading={loading}
          placeholder="No additional notes"
        />
      </Grid>
    </Grid>
  );

  const editContent = formContext ? (
    <FormContainer formContext={formContext}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="startDate"
            label="Start Date"
            type="date"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="endDate"
            label="End Date"
            type="date"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectElement
            name="daysPerWeek"
            label="Days Per Week"
            options={[
              { id: 1, title: '1 day' },
              { id: 2, title: '2 days' },
              { id: 3, title: '3 days' },
              { id: 4, title: '4 days' },
              { id: 5, title: '5 days' },
            ]}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)' }}>
              Preferred Days
            </label>
            {DAYS_OF_WEEK.map((day) => (
              <CheckboxElement
                key={day.value}
                name={`preferredDays.${day.value}`}
                label={day.label}
              />
            ))}
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="startTime"
            label="Start Time"
            type="time"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldElement
            name="endTime"
            label="End Time"
            type="time"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextFieldElement
            name="notes"
            label="Schedule Notes"
            fullWidth
            size="small"
            multiline
            rows={3}
            helperText="Additional scheduling information or requirements"
          />
        </Grid>
      </Grid>
    </FormContainer>
  ) : null;

  return (
    <EditableCard
      title="Schedule Information"
      icon={<ScheduleIcon color="primary" />}
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
