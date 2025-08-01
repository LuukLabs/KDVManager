import React from "react";
import { useTranslation } from "react-i18next";
import { getListGroupsQueryKey, useDeleteGroup } from "@api/endpoints/groups/groups";
import { useQueryClient } from "@tanstack/react-query";
import { createDeleteTexts } from "../../utils/createDeleteTexts";
import { IconDeleteButton } from "@components/delete/IconDeleteButton";
import DeleteIcon from "@mui/icons-material/Delete";

type DeleteGroupButtonProps = {
  id: string;
  displayName?: string;
};

export const DeleteGroupButton: React.FC<DeleteGroupButtonProps> = ({ id, displayName }) => {
  const { t } = useTranslation();
  const mutation = useDeleteGroup();
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
  };

  const config = {
    id,
    texts: createDeleteTexts(t, {
      entityName: t("group"),
      customTexts: {
        confirmation: displayName
          ? {
              title: t("delete.group.title", {
                name: displayName,
                defaultValue: `Remove group '{{name}}'`,
              }),
              message: t("delete.group.message", {
                name: displayName,
                defaultValue:
                  "Are you sure you want to permanently remove the group '{{name}}'? This action cannot be undone and all related data will be lost.",
              }),
            }
          : undefined,
        errors: displayName
          ? {
              conflict: t("delete.group.errors.conflict", {
                name: displayName,
                defaultValue:
                  "Unable to remove group '{{name}}' because it is currently used in the planning. Please remove all dependencies before deleting.",
              }),
            }
          : undefined,
        success: displayName
          ? t("delete.group.success", {
              name: displayName,
              defaultValue: "Group '{{name}}' was successfully removed.",
            })
          : undefined,
      },
    }),
    onSuccess: handleSuccess,
  };

  return (
    <IconDeleteButton mutation={mutation} config={config} size="small">
      <DeleteIcon />
    </IconDeleteButton>
  );
};
