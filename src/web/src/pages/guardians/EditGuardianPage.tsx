import { Container, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import { GuardianForm } from "../../features/guardians/GuardianForm";
import { useGetGuardianById, useUpdateGuardian } from "@api/endpoints/guardians/guardians";
import { useTranslation } from "react-i18next";

type GuardianFormData = {
  givenName: string;
  familyName: string;
  dateOfBirth?: string;
  email: string;
  bsn: string;
  phoneNumbers: { id?: string; number: string; type: "Mobile" | "Home" | "Work" | "Other" }[];
};

const EditGuardianPage = () => {
  const { guardianId } = useParams<{ guardianId: string }>();
  const { t } = useTranslation();
  const { data: guardian, isLoading, error } = useGetGuardianById(guardianId!);
  const updateGuardian = useUpdateGuardian();

  if (!guardianId) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">{t("Guardian ID is required")}</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">{t("Guardian not found")}</Alert>
      </Container>
    );
  }

  const handleSubmit = async (data: GuardianFormData) => {
    await updateGuardian.mutateAsync({
      id: guardianId,
      data: {
        id: guardianId,
        givenName: data.givenName,
        familyName: data.familyName,
        dateOfBirth: data.dateOfBirth!,
        email: data.email,
        phoneNumbers: data.phoneNumbers.map((p) => ({
          id: p.id,
          number: p.number,
          type: p.type,
        })),
      },
    });
  };

  return (
    <Container maxWidth="md">
      <GuardianForm
        guardianId={guardianId}
        title={t("editGuardian")}
        initialData={
          guardian
            ? {
                givenName: guardian.givenName,
                familyName: guardian.familyName,
                dateOfBirth: guardian.dateOfBirth ?? undefined,
                email: guardian.email ?? "",
                bsn: "", // not part of API yet
                phoneNumbers: (guardian.phoneNumbers ?? []).map((p) => ({
                  id: p.id,
                  number: p.number ?? "",
                  type: p.type ?? "Mobile",
                })),
              }
            : undefined
        }
        onSubmit={handleSubmit}
        isLoading={isLoading || updateGuardian.isPending}
      />
    </Container>
  );
};

export const Component = EditGuardianPage;
