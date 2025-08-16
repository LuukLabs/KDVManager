import { Container } from "@mui/material";
import { GuardianForm } from "../../features/guardians/GuardianForm";
import { useTranslation } from "react-i18next";
import { useAddGuardian } from "@api/endpoints/guardians/guardians";
import { type PhoneNumberType } from "@api/models/phoneNumberType";

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
    <Container maxWidth="md">
      <GuardianForm
        title={t("Add New Guardian")}
        onSubmit={handleSubmit}
        isLoading={createGuardian.isPending}
      />
    </Container>
  );
};

export const Component = NewGuardianPage;
