import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { getListGuardiansQueryKey, useAddGuardian } from "@api/crm/endpoints/guardians/guardians";
import { FormPageLayout } from "@components/layout/FormPageLayout";
import { GuardianForm, type GuardianFormData } from "../../features/guardians/GuardianForm";

const NewGuardianPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const createGuardian = useAddGuardian();
  const navigate = useNavigate();

  const handleSubmit = async (data: GuardianFormData) => {
    const guardianId = await createGuardian.mutateAsync({
      data: {
        givenName: data.givenName,
        familyName: data.familyName,
        dateOfBirth: data.dateOfBirth ?? undefined,
        email: data.email,
        phoneNumbers: data.phoneNumbers.map((phoneNumber) => ({
          number: phoneNumber.number,
          type: phoneNumber.type,
        })),
      },
    });
    void queryClient.invalidateQueries({ queryKey: getListGuardiansQueryKey() });
    enqueueSnackbar(t("Guardian created"), { variant: "success" });
    navigate(`/guardians/${guardianId}`);
  };

  return (
    <FormPageLayout title={t("Add New Guardian")}>
      <GuardianForm onSubmit={handleSubmit} />
    </FormPageLayout>
  );
};

export const Component = NewGuardianPage;
