/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Grid, Stack, Button, Paper, IconButton, Typography, Chip, Box } from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { FormContainer, TextFieldElement, SelectElement } from "react-hook-form-mui";
import { EditableCard } from "../cards/EditableCard";
import { FieldDisplay } from "../forms/FieldDisplay";
import { type UseFormReturn, useFieldArray } from "react-hook-form";
type PhoneNumber = {
  id?: string;
  number: string;
  type: "Mobile" | "Home" | "Work" | "Other";
};

type GuardianContactInformationCardProps = {
  // View props
  email?: string;
  phoneNumbers?: PhoneNumber[];
  loading?: boolean;

  // Edit props
  isEditing?: boolean;
  formContext?: UseFormReturn<any>;
  onSave?: () => void;
  onCancel?: () => void;
  onEditToggle?: (editing: boolean) => void;
};

export const GuardianContactInformationCard: React.FC<GuardianContactInformationCardProps> = ({
  email,
  phoneNumbers = [],
  loading,
  isEditing,
  formContext,
  onSave,
  onCancel,
  onEditToggle,
}) => {
  const { t } = useTranslation();
  // Always call useFieldArray, but use a dummy control if not editing
  const dummyControl = { control: undefined } as any;
  const fa = useFieldArray({
    control: formContext?.control ?? dummyControl,
    name: "phoneNumbers",
  });
  const phoneFields = formContext ? fa.fields : [];
  const addPhoneNumber = useCallback(() => {
    const appendFn = formContext ? fa.append : () => undefined;
    if (phoneFields.length < 10) {
      appendFn({ number: "", type: "Mobile" });
    }
  }, [formContext, fa.append, phoneFields.length]);

  const removePhoneNumber = useCallback(
    (index: number) => {
      const removeFn = formContext ? fa.remove : () => undefined;
      removeFn(index);
    },
    [formContext, fa.remove],
  );

  // View mode content
  const viewContent = (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <FieldDisplay label={t("Email")} value={email} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t("Phone Numbers")}
          </Typography>
          {(phoneNumbers ?? []).length > 0 ? (
            <Stack spacing={1}>
              {phoneNumbers.map((phone, index) => (
                <Box key={phone.id || index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body1" sx={{ flexGrow: 1 }}>
                    {phone.number}
                  </Typography>
                  <Chip label={t(phone.type)} size="small" variant="outlined" color="default" />
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t("No phone numbers")}
            </Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
  // Edit mode content
  const editContent = formContext ? (
    <FormContainer formContext={formContext}>
      <Grid container spacing={3}>
        {/* Email */}
        <Grid size={{ xs: 12 }}>
          <TextFieldElement
            name="email"
            label={t("Email")}
            type="email"
            fullWidth
            rules={{
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t("Invalid email address"),
              },
            }}
          />
        </Grid>

        {/* Phone Numbers */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            {t("Phone Numbers")}
          </Typography>

          {phoneFields.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                textAlign: "center",
                backgroundColor: "grey.50",
                borderStyle: "dashed",
              }}
            >
              <PhoneIcon sx={{ color: "text.secondary", mb: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t("No phone numbers added yet")}
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addPhoneNumber}
                variant="outlined"
                size="small"
              >
                {t("Add Phone Number")}
              </Button>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {phoneFields.map((field, index) => (
                <Paper
                  key={field.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    position: "relative",
                  }}
                >
                  <Grid container spacing={2}>
                    {/* Type Selector */}
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <SelectElement
                        name={`phoneNumbers.${index}.type`}
                        label={t("Type")}
                        options={[
                          { id: "Mobile", label: t("Mobile") },
                          { id: "Home", label: t("Home") },
                          { id: "Work", label: t("Work") },
                          { id: "Other", label: t("Other") },
                        ]}
                        fullWidth
                        size="small"
                      />
                    </Grid>

                    {/* Phone Number */}
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "start" }}>
                        <TextFieldElement
                          name={`phoneNumbers.${index}.number`}
                          label={t("Phone Number")}
                          placeholder="+31612345678"
                          fullWidth
                          size="small"
                          rules={{
                            pattern: {
                              value: /^\+?[1-9]\d{7,18}$/,
                              message: t("Must be E.164 format (e.g. +31612345678)"),
                            },
                          }}
                          helperText={
                            (formContext?.formState?.errors?.phoneNumbers as any[] | undefined)?.[
                              index
                            ]?.number?.message ?? undefined
                          }
                        />
                        <IconButton
                          onClick={() => removePhoneNumber(index)}
                          color="error"
                          size="small"
                          sx={{
                            minWidth: { xs: 40, md: "auto" },
                            minHeight: { xs: 40, md: "auto" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              {/* Add Button */}
              {phoneFields.length < 10 && (
                <Button
                  startIcon={<AddIcon />}
                  onClick={addPhoneNumber}
                  variant="outlined"
                  size="small"
                  sx={{ alignSelf: "flex-start" }}
                >
                  {t("Add Another Phone")}
                </Button>
              )}

              {/* Max limit warning */}
              {phoneFields.length >= 10 && (
                <Typography variant="caption" color="text.secondary">
                  {t("Maximum phone numbers reached (10)")}
                </Typography>
              )}
            </Stack>
          )}
        </Grid>
      </Grid>
    </FormContainer>
  ) : null;

  return (
    <EditableCard
      title={t("Contact Information")}
      icon={<EmailIcon color="primary" />}
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
