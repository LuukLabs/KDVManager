import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { type AddChildCommand } from "@api/crm/models/addChildCommand";
import { getListChildrenQueryKey, useAddChild } from "@api/crm/endpoints/children/children";
import { FormPageLayout } from "@components/layout/FormPageLayout";
import { ChildForm } from "../../features/children/ChildForm";

const NewChildPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const addChild = useAddChild();
  const navigate = useNavigate();

  const handleSubmit = async (data: AddChildCommand) => {
    const childId = await addChild.mutateAsync({ data });
    void queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey({}) });
    enqueueSnackbar(t("Child created"), { variant: "success" });
    navigate(`/children/${childId}`);
  };

  return (
    <FormPageLayout title={t("Add New Child")}>
      <Alert severity="info" sx={{ mb: 3 }}>
        {t("A unique child identification number will be automatically assigned when you save.")}
      </Alert>
      <ChildForm onSubmit={handleSubmit} />
    </FormPageLayout>
  );
};

export const Component = NewChildPage;
