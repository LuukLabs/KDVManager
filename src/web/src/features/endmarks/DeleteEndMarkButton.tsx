import React from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { createDeleteTexts } from "../../utils/createDeleteTexts";
import { IconDeleteButton } from "@components/delete/IconDeleteButton";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getListEndMarksQueryKey,
  useDeleteEndMark,
} from "@api/scheduling/endpoints/end-marks/end-marks";
import { getGetChildSchedulesQueryKey } from "@api/scheduling/endpoints/schedules/schedules";

type DeleteEndMarkButtonProps = {
  id: string;
  childId: string;
};

export const DeleteEndMarkButton: React.FC<DeleteEndMarkButtonProps> = ({ id, childId }) => {
  const { t } = useTranslation();
  const mutation = useDeleteEndMark();
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: getListEndMarksQueryKey({ childId }) });
    queryClient.invalidateQueries({ queryKey: getGetChildSchedulesQueryKey({ childId }) });
  };

  const config = {
    id,
    texts: createDeleteTexts(t, { entityName: t("end mark") }),
    onSuccess: handleSuccess,
  };

  return (
    <IconDeleteButton mutation={mutation} config={config} size="small">
      <DeleteIcon fontSize="small" />
    </IconDeleteButton>
  );
};
