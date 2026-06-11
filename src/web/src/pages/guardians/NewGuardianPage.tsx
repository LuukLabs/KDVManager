import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import { GuardianForm } from "@features/guardians/GuardianForm";
import { FormPageHeader } from "@components/layout/FormPageHeader";
import { useTranslation } from "react-i18next";
import { useAddGuardian } from "@api/crm/endpoints/guardians/guardians";
import { type PhoneNumberType } from "@api/crm/models/phoneNumberType";

type GuardianFormData = {
  givenName: string;
  familyName: string;
  dateOfBirth?: string;
  email: string;
  bsn: string;
  phoneNumbers: { number: string; type: PhoneNumberType }[];
};

const NewGuardianPage = () => {
  const { t } = useTranslation();
  const createGuardian = useAddGuardian();

  const handleSubmit = async (data: GuardianFormData) => {
    await createGuardian.mutateAsync({
      data: {
        givenName: data.givenName,
        familyName: data.familyName,
        dateOfBirth: data.dateOfBirth,
        email: data.email,
        phoneNumbers: data.phoneNumbers.map((p) => ({
          number: p.number,
          type: p.type,
        })),
      },
    });
  };

  return (
    <Container maxWidth="md" disableGutters>
      <Stack spacing={3} sx={{ pb: 4 }}>
        <FormPageHeader
          title={t("New Guardian")}
          subtitle={t("Add a new guardian and their contact details.")}
          backTo="/guardians"
        />
        <GuardianForm onSubmit={handleSubmit} isLoading={createGuardian.isPending} />
      </Stack>
    </Container>
  );
};

export const Component = NewGuardianPage;
