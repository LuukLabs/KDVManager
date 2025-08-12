import { useState } from "react";
import { Container, Box, Alert, useMediaQuery, useTheme } from "@mui/material";
import { useForm } from "react-hook-form";
import { useParams, useLoaderData, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";

import { type UpdateChildCommand } from "@api/models/updateChildCommand";
import { type UnprocessableEntityResponse } from "@api/models/unprocessableEntityResponse";
import {
  getListChildrenQueryKey,
  useUpdateChild,
  useGetChildById,
  useArchiveChild,
} from "@api/endpoints/children/children";
import { type updateChildPageLoader } from "./updateChildPage.loader";

import { ChildHeader } from "../../components/child/ChildHeader";
import { BasicInformationCard } from "../../components/child/BasicInformationCard";
import { MedicalInformationCard } from "../../components/child/MedicalInformationCard";
import { ContactInformationCard } from "../../components/child/ContactInformationCard";
import { ScheduleInformationCard } from "../../components/child/ScheduleInformationCard";
import { ChildScheduleView } from "../../features/schedules/ChildScheduleView";
import { AbsenceList } from "../../features/absence/AbsenceList";

interface ExtendedUpdateChildCommand extends UpdateChildCommand {
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

const UpdateChildPageModern = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const { childId } = useParams() as { childId: string };
  const loaderData = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof updateChildPageLoader>>
  >;

  const { data: child, isLoading } = useGetChildById(childId, {
    query: { initialData: loaderData },
  });

  const { mutate: updateChild } = useUpdateChild();
  const { mutate: archiveChild, isPending: isArchiving } = useArchiveChild();

  // Track which sections are in edit mode
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({
    basic: false,
    medical: false,
    contact: false,
    schedule: false,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const formContext = useForm<ExtendedUpdateChildCommand>({
    defaultValues: {
      id: childId,
      givenName: child?.givenName || "",
      familyName: child?.familyName || "",
      dateOfBirth: child?.dateOfBirth || "",
      cid: child?.cid || "",
      // Initialize extended fields with empty defaults
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


  const handleSectionEdit = (section: string, isEditing: boolean) => {
    setEditingSections(prev => ({
      ...prev,
      [section]: isEditing
    }));
  };

  const onSubmit = (data: ExtendedUpdateChildCommand) => {
    setSubmitError(null);
    
    // Extract only the fields that exist in UpdateChildCommand
    const updateData: UpdateChildCommand = {
      id: data.id,
      givenName: data.givenName,
      familyName: data.familyName,
      dateOfBirth: data.dateOfBirth,
      cid: data.cid,
    };

    updateChild(
      { id: childId, data: updateData },
      {
        onSuccess: () => {
          enqueueSnackbar(t("Child updated successfully"), { variant: "success" });
          void queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey({}) });
          // Exit edit mode for all sections
          setEditingSections({
            basic: false,
            medical: false,
            contact: false,
            schedule: false,
          });
        },
        onError: (error: UnprocessableEntityResponse) => {
          if (error.errors && Array.isArray(error.errors)) {
            error.errors.forEach((propertyError) => {
              setError(propertyError.property as any, {
                type: "server",
                message: propertyError.title,
              });
            });
          } else {
            setSubmitError("Failed to update child record. Please try again.");
          }
        },
      }
    );
  };

  const handleArchive = () => {
    if (!child) return;
    
    archiveChild(
      { id: childId },
      {
        onSuccess: () => {
          enqueueSnackbar(t("Child archived successfully"), { variant: "success" });
          void queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey({}) });
          navigate("/children");
        },
        onError: () => {
          enqueueSnackbar(t("Failed to archive child"), { variant: "error" });
        },
      }
    );
  };

  const handleDelete = () => {
    // Implement delete functionality if needed
    console.log("Delete not implemented yet");
  };

  if (isLoading || !child) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box>Loading...</Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with child info and actions */}
      <ChildHeader
        firstName={child.givenName}
        lastName={child.familyName}
        dateOfBirth={child.dateOfBirth}
        cid={child.cid || undefined}
        onEdit={() => handleSectionEdit("basic", true)}
        onArchive={handleArchive}
        onDelete={handleDelete}
        loading={isArchiving}
      />

      {/* Error Alert */}
      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      {/* Information Cards */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
        {/* Basic Information */}
        <BasicInformationCard
          firstName={child.givenName}
          lastName={child.familyName}
          dateOfBirth={child.dateOfBirth}
          cid={child.cid || undefined}
          loading={isLoading}
          isEditing={editingSections.basic}
          formContext={formContext}
          onSave={handleSubmit(onSubmit)}
          onCancel={() => {
            reset();
            handleSectionEdit("basic", false);
          }}
          onEditToggle={(editing) => handleSectionEdit("basic", editing)}
        />

        {/* Medical Information */}
        <MedicalInformationCard
          // Note: These would come from extended child data in a real implementation
          allergies=""
          medication=""
          medicalNotes=""
          dietaryRequirements=""
          emergencyContact=""
          emergencyPhone=""
          doctorName=""
          doctorPhone=""
          loading={isLoading}
          isEditing={editingSections.medical}
          formContext={formContext}
          onSave={handleSubmit(onSubmit)}
          onCancel={() => {
            reset();
            handleSectionEdit("medical", false);
          }}
          onEditToggle={(editing) => handleSectionEdit("medical", editing)}
        />

        {/* Contact Information */}
        <ContactInformationCard
          // Note: These would come from extended child data in a real implementation
          address=""
          city=""
          postalCode=""
          phoneNumber=""
          emailAddress=""
          parentName=""
          parentPhone=""
          parentEmail=""
          loading={isLoading}
          isEditing={editingSections.contact}
          formContext={formContext}
          onSave={handleSubmit(onSubmit)}
          onCancel={() => {
            reset();
            handleSectionEdit("contact", false);
          }}
          onEditToggle={(editing) => handleSectionEdit("contact", editing)}
        />

        {/* Schedule Information */}
        <ScheduleInformationCard
          // Note: These would come from extended child data in a real implementation
          startDate=""
          endDate=""
          daysPerWeek={3}
          preferredDays={[]}
          startTime="08:00"
          endTime="16:00"
          notes=""
          loading={isLoading}
          isEditing={editingSections.schedule}
          formContext={formContext}
          onSave={handleSubmit(onSubmit)}
          onCancel={() => {
            reset();
            handleSectionEdit("schedule", false);
          }}
          onEditToggle={(editing) => handleSectionEdit("schedule", editing)}
        />
      </Box>

      {/* Schedule and Absence Management */}
      <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 3 }}>
        {/* Schedule View */}
        <Box sx={{ flex: 1 }}>
          <ChildScheduleView childId={childId} />
        </Box>

        {/* Absence List */}
        <Box sx={{ flex: 1 }}>
          <AbsenceList childId={childId} />
        </Box>
      </Box>
    </Container>
  );
};

export const Component = UpdateChildPageModern;
