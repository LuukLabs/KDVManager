import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getListClosurePeriodsQueryKey,
  useDeleteClosurePeriod,
} from "@api/endpoints/closure-periods/closure-periods";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { IconDeleteButton } from "@components/delete/IconDeleteButton";
import { createDeleteTexts } from "../../utils/createDeleteTexts";

type DeleteClosurePeriodButtonProps = {
  id: string;
};

export const DeleteClosurePeriodButton: React.FC<DeleteClosurePeriodButtonProps> = ({ id }) => {
  const { t } = useTranslation();
  const mutation = useDeleteClosurePeriod();
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: getListClosurePeriodsQueryKey() });
  };

  const config = {
    id,
    texts: createDeleteTexts(t, { entityName: t("closure period") }),
    onSuccess: handleSuccess,
  };

  return (
    <IconDeleteButton mutation={mutation} config={config} size="small">
      <DeleteIcon />
    </IconDeleteButton>
  );
};
