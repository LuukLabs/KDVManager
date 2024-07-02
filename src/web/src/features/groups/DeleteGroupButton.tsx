import { getListGroupsQueryKey, useDeleteGroup } from "@api/endpoints/groups/groups";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import IconButton from "@mui/material/IconButton/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

type DeleteGroupButtonProps = {
  id: string;
};

export const DeleteGroupButton: React.FC<DeleteGroupButtonProps> = ({ id }) => {
  const { t } = useTranslation();
  const mutate = useDeleteGroup();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const handleOnDeleteClick = async () => {
    await mutate.mutateAsync({ id: id }, { onSuccess: onMutateSuccess, onError: onMutateError });
  };

  const onMutateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
    enqueueSnackbar(t("Group deleted"), { variant: "success" });
  };

  const onMutateError = (error: any) => {
    enqueueSnackbar(t("Error occurred while deleting group"), { variant: "error" });
    console.error("Error deleting group:", error);
  };

  return (
    <IconButton
      aria-label={t("delete", { ns: "common", context: "aria-label" })}
      onClick={handleOnDeleteClick}
    >
      <DeleteIcon />
    </IconButton>
  );
};
