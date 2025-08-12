import { useState } from "react";
import { Container, Typography, Box, Button, Alert } from "@mui/material";
import { Save as SaveIcon, ArrowBack as BackIcon } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { type AddChildCommand } from "@api/models/addChildCommand";
import { getListChildrenQueryKey, useAddChild } from "@api/endpoints/children/children";
import { UnprocessableEntityResponse } from "@api/models/unprocessableEntityResponse";

import { BasicInformationCard } from "../../components/child/BasicInformationCard";
import { MedicalInformationCard } from "../../components/child/MedicalInformationCard";
import { ContactInformationCard } from "../../components/child/ContactInformationCard";
import { ScheduleInformationCard } from "../../components/child/ScheduleInformationCard";

interface ExtendedAddChildCommand extends AddChildCommand {
  // Medical information
  allergies?: string;
  medication?: string;
  medicalNotes?: string;
  dietaryRequirements?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  doctorName?: string;
  doctorPhone?: string;
  
  // Contact information
  address?: string;
  city?: string;
  postalCode?: string;
  phoneNumber?: string;
  emailAddress?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  
  // Schedule information
  startDate?: string;
  endDate?: string;
  daysPerWeek?: number;
  preferredDays?: string[];
  startTime?: string;
  endTime?: string;
  scheduleNotes?: string;
}

const NewChildPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useAddChild();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formContext = useForm<ExtendedAddChildCommand>({
    defaultValues: {
      givenName: "",
      familyName: "",
      dateOfBirth: "",
      cid: "",
      // Initialize extended fields
      allergies: "",
      medication: "",
      medicalNotes: "",
      dietaryRequirements: "",
      emergencyContact: "",
      emergencyPhone: "",
      doctorName: "",
      doctorPhone: "",
      address: "",
      city: "",
      postalCode: "",
      phoneNumber: "",
      emailAddress: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      startDate: "",
      endDate: "",
      daysPerWeek: 3,
      preferredDays: [],
      startTime: "08:00",
      endTime: "16:00",
      scheduleNotes: "",
    },
  });

  const { handleSubmit, setError, reset } = formContext;

  const onSubmit = (data: ExtendedAddChildCommand) => {
    setSubmitError(null);
    
    // Extract only the required fields for the API
    const childData: AddChildCommand = {
      givenName: data.givenName,
      familyName: data.familyName,
      dateOfBirth: data.dateOfBirth,
      cid: data.cid,
    };

    mutate(
      { data: childData },
      { 
        onSuccess: onSuccess, 
        onError: onMutateError 
      }
    );
  };

  const onSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey({}) });
    navigate("/children");
  };

  const onMutateError = (error: UnprocessableEntityResponse) => {
    if (error.errors && Array.isArray(error.errors)) {
      error.errors.forEach((propertyError) => {
        setError(propertyError.property as any, {
          type: "server",
          message: propertyError.title,
        });
      });
    } else {
      setSubmitError("Failed to create child record. Please try again.");
    }
  };

  const handleBack = () => {
    navigate("/children");
  };

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        py: { xs: 2, md: 4 },
        px: { xs: 2, md: 4 }
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
          variant="outlined"
        >
          {t("Back to Children List", { ns: "common" })}
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          {t("Create New Child Record")}
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          {t("Enter the child's information below. Required fields are marked with an asterisk (*)")}
        </Typography>
      </Box>

      {/* Error Alert */}
      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      {/* Form Cards - Scrollable Content */}
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        display: "flex", 
        flexDirection: "column", 
        gap: 3,
        mb: 3
      }}>
        {/* Basic Information - Always in edit mode for new records */}
        <BasicInformationCard
          isEditing={true}
          formContext={formContext}
        />

        {/* Medical Information */}
        <MedicalInformationCard
          isEditing={true}
          formContext={formContext}
        />

        {/* Contact Information */}
        <ContactInformationCard
          isEditing={true}
          formContext={formContext}
        />

        {/* Schedule Information */}
        <ScheduleInformationCard
          isEditing={true}
          formContext={formContext}
        />
      </Box>

      {/* Action Buttons - Sticky Bottom */}
      <Box sx={{ 
        display: "flex", 
        gap: 2, 
        justifyContent: "flex-end",
        backgroundColor: "background.default",
        py: 2,
        borderTop: 1,
        borderColor: "divider",
        position: "sticky",
        bottom: 0
      }}>
        <Button
          variant="outlined"
          onClick={() => reset()}
          disabled={isPending}
        >
          {t("Reset Form", { ns: "common" })}
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          startIcon={<SaveIcon />}
          size="large"
        >
          {isPending ? t("Creating...", { ns: "common" }) : t("Create Child Record", { ns: "common" })}
        </Button>
      </Box>
    </Container>
  );
};

export const Component = NewChildPage;
