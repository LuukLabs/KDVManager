import React from "react";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getListClosurePeriodsQueryKey, useDeleteClosurePeriod } from "@api/endpoints/closure-periods/closure-periods";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { useQueryClient } from "@tanstack/react-query";

type DeleteClosurePeriodButtonProps = {
  id: string;
}

export const DeleteClosurePeriodButton: React.FC<DeleteClosurePeriodButtonProps> = ({ id }) => {
  const { t } = useTranslation();
  const mutation = useDeleteClosurePeriod();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const handleDelete = () => {
    mutation.mutate(
      { id: id },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: getListClosurePeriodsQueryKey() });
          enqueueSnackbar(t("Deleted successfully"), { variant: "success" });
        },
      }
    );
  };

  return (
    <IconButton
      aria-label={t("Delete")}
      color="error"
      onClick={handleDelete}
      disabled={mutation.status === "pending"}
    >
      <DeleteIcon />
    </IconButton>
  );
};
