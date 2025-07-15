import { getListGroupsQueryKey, useDeleteGroup } from "@api/endpoints/groups/groups";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { type UnprocessableEntityResponse } from "@api/models/unprocessableEntityResponse";
import { type ProblemDetails } from "@api/models/problemDetails";

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

  const onMutateError = (error: ProblemDetails | UnprocessableEntityResponse) => {
    if ((error as ProblemDetails).status === 409) {
      enqueueSnackbar(t("Group in use"), { variant: "warning" });
    } else if ((error as ProblemDetails).status === 404) {
      enqueueSnackbar(t("Group not found"), { variant: "error" });
    } else {
      enqueueSnackbar(t("Unknown error occurred"), { variant: "error" });
    }
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
