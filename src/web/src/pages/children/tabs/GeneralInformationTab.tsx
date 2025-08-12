import { useState } from "react";
import { Grid, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

import { 
  useUpdateChild, 
  getListChildrenQueryKey,
  getGetChildByIdQueryOptions 
} from "@api/endpoints/children/children";
import { type UpdateChildCommand } from "@api/models/updateChildCommand";
import { type UnprocessableEntityResponse } from "@api/models/unprocessableEntityResponse";
import { type ChildDetailVM } from "@api/models/childDetailVM";

import {
  BasicInformationCard,
  MedicalInformationCard,
  ContactInformationCard,
} from "../../../components/child";

interface GeneralInformationTabProps {
  child: ChildDetailVM;
}

export const GeneralInformationTab: React.FC<GeneralInformationTabProps> = ({ child }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { mutateAsync: updateChild } = useUpdateChild();
  
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({
    basic: false,
    medical: false,
    contact: false,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form for basic information (connected to API)
  const basicFormContext = useForm<UpdateChildCommand>({
    defaultValues: {
      id: child.id,
      givenName: child.givenName || "",
      familyName: child.familyName || "",
      dateOfBirth: child.dateOfBirth || "",
      cid: child.cid || "",
    },
  });

  // Forms for extended information (placeholder for now)
  const medicalFormContext = useForm({
    defaultValues: {
      allergies: "",
      medication: "",
      medicalNotes: "",
      dietaryRequirements: "",
      emergencyContact: "",
      emergencyPhone: "",
      doctorName: "",
      doctorPhone: "",
    },
  });

  const contactFormContext = useForm({
    defaultValues: {
      address: "",
      city: "",
      postalCode: "",
      phoneNumber: "",
      emailAddress: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
    },
  });

  const handleSectionEdit = (section: string, isEditing: boolean) => {
    setEditingSections(prev => ({
      ...prev,
      [section]: isEditing
    }));
    setSubmitError(null);
  };

  const handleBasicSave = async () => {
    try {
      setSubmitError(null);
      const data = basicFormContext.getValues();
      
      if (!child.id) {
        throw new Error("Child ID is required");
      }
      
      await updateChild({
        id: child.id,
        data: {
          id: child.id,
          givenName: data.givenName,
          familyName: data.familyName,
          dateOfBirth: data.dateOfBirth,
          cid: data.cid,
        }
      });

      // Update cache and show success
      await queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey({}) });
      await queryClient.invalidateQueries({ 
        queryKey: getGetChildByIdQueryOptions(child.id).queryKey 
      });
      
      enqueueSnackbar(t("Basic information updated successfully"), { variant: "success" });
      handleSectionEdit("basic", false);
      
    } catch (error) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const validationError = error as UnprocessableEntityResponse;
        validationError.errors.forEach((propertyError) => {
          basicFormContext.setError(propertyError.property as any, {
            type: "server",
            message: propertyError.title,
          });
        });
      } else {
        setSubmitError("Failed to update basic information. Please try again.");
      }
    }
  };

  const handleMedicalSave = async () => {
    // Placeholder - would integrate with API when medical fields are added
    enqueueSnackbar(t("Medical information updated successfully"), { variant: "success" });
    handleSectionEdit("medical", false);
  };

  const handleContactSave = async () => {
    // Placeholder - would integrate with API when contact fields are added
    enqueueSnackbar(t("Contact information updated successfully"), { variant: "success" });
    handleSectionEdit("contact", false);
  };

  const handleCancel = (section: string) => {
    if (section === "basic") {
      basicFormContext.reset();
    } else if (section === "medical") {
      medicalFormContext.reset();
    } else if (section === "contact") {
      contactFormContext.reset();
    }
    handleSectionEdit(section, false);
    setSubmitError(null);
  };

  return (
    <>
      {/* Error Alert */}
      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      {/* Information Cards */}
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <BasicInformationCard
            firstName={child.givenName}
            lastName={child.familyName}
            dateOfBirth={child.dateOfBirth}
            cid={child.cid || undefined}
            isEditing={editingSections.basic}
            formContext={basicFormContext}
            onSave={handleBasicSave}
            onCancel={() => handleCancel("basic")}
            onEditToggle={(editing) => handleSectionEdit("basic", editing)}
          />
        </Grid>

        {/* Medical Information */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <MedicalInformationCard
            // Placeholder data - would come from API
            allergies=""
            medication=""
            medicalNotes=""
            dietaryRequirements=""
            emergencyContact=""
            emergencyPhone=""
            doctorName=""
            doctorPhone=""
            isEditing={editingSections.medical}
            formContext={medicalFormContext}
            onSave={handleMedicalSave}
            onCancel={() => handleCancel("medical")}
            onEditToggle={(editing) => handleSectionEdit("medical", editing)}
          />
        </Grid>

        {/* Contact Information */}
        <Grid size={{ xs: 12 }}>
          <ContactInformationCard
            // Placeholder data - would come from API
            address=""
            city=""
            postalCode=""
            phoneNumber=""
            emailAddress=""
            parentName=""
            parentPhone=""
            parentEmail=""
            isEditing={editingSections.contact}
            formContext={contactFormContext}
            onSave={handleContactSave}
            onCancel={() => handleCancel("contact")}
            onEditToggle={(editing) => handleSectionEdit("contact", editing)}
          />
        </Grid>
      </Grid>
    </>
  );
};
