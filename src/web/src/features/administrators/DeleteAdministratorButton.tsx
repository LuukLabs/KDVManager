import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getListAdministratorsQueryKey,
  useDeleteAdministrator,
} from "@api/crm/endpoints/administrators/administrators";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { IconDeleteButton } from "@components/delete/IconDeleteButton";
import { createDeleteTexts } from "../../utils/createDeleteTexts";

type DeleteAdministratorButtonProps = {
  id: string;
};

export const DeleteAdministratorButton: React.FC<DeleteAdministratorButtonProps> = ({ id }) => {
  const { t } = useTranslation();
  const mutation = useDeleteAdministrator();
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getListAdministratorsQueryKey() });
  };

  const config = {
    id,
    texts: createDeleteTexts(t, { entityName: t("administrator") }),
    onSuccess: handleSuccess,
  };

  return (
    <IconDeleteButton mutation={mutation} config={config} size="small">
      <DeleteIcon />
    </IconDeleteButton>
  );
};
