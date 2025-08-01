import React from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { createDeleteTexts } from "../../utils/createDeleteTexts";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getGetChildSchedulesQueryKey,
  useDeleteSchedule,
} from "@api/endpoints/schedules/schedules";
import { IconDeleteButton } from "@components/delete/IconDeleteButton";

type DeleteScheduleButtonProps = {
  id: string;
};

export const DeleteScheduleButton: React.FC<DeleteScheduleButtonProps> = ({ id }) => {
  const { t } = useTranslation();
  const mutation = useDeleteSchedule();
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: getGetChildSchedulesQueryKey() });
  };

  const config = {
    id,
    texts: createDeleteTexts(t, { entityName: t("schedule") }),
    onSuccess: handleSuccess,
  };

  return (
    <IconDeleteButton mutation={mutation} config={config} size="small">
      <DeleteIcon fontSize="small" />
    </IconDeleteButton>
  );
};
