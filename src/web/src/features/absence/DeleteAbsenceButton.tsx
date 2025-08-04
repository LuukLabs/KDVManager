import React from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { createDeleteTexts } from "../../utils/createDeleteTexts";
import { IconDeleteButton } from "@components/delete/IconDeleteButton";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getGetAbsencesByChildIdQueryKey,
  useDeleteAbsence,
} from "@api/endpoints/absences/absences";

type DeleteAbsenceButton = {
  id: string;
  childId: string;
};

export const DeleteAbsenceButton: React.FC<DeleteAbsenceButton> = ({ id, childId }) => {
  const { t } = useTranslation();
  const mutation = useDeleteAbsence();
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: getGetAbsencesByChildIdQueryKey(childId) });
  };

  const config = {
    id,
    texts: createDeleteTexts(t, {
      entityName: t("absence"),
    }),
    onSuccess: handleSuccess,
  };

  return (
    <IconDeleteButton mutation={mutation} config={config} size="small">
      <DeleteIcon />
    </IconDeleteButton>
  );
};
