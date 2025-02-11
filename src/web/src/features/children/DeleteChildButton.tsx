import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDeleteChild, getGetAllChildrenQueryKey } from "@api/endpoints/children/children";

type DeleteChildButtonProps = {
  id: string;
  fullName?: string;
};

export const DeleteChildButton: React.FC<DeleteChildButtonProps> = ({ id, fullName }) => {
  const { t } = useTranslation();
  const mutate = useDeleteChild();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const handleOnDeleteClick = async () => {
    await mutate.mutateAsync({ id: id }, { onSuccess: onMutateSuccess, onError: onMutateError });
  };

  const onMutateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: getGetAllChildrenQueryKey() });
    const message = fullName
      ? t("{{fullName}} has been deleted", { fullName })
      : t("Child has been deleted");
    enqueueSnackbar(message, { variant: "success" });
  };

  const onMutateError = (error: any) => {
    enqueueSnackbar(t("Error occurred while deleting child"), { variant: "error" });
    console.error("Error deleting child:", error);
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
