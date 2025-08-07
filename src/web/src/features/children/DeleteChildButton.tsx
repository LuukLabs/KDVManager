import React from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { createDeleteTexts } from "../../utils/createDeleteTexts";
import { IconDeleteButton } from "@components/delete/IconDeleteButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { getListChildrenQueryKey, useDeleteChild } from "@api/endpoints/children/children";

type DeleteChildButton = {
  id: string;
  displayName: string;
};

export const DeleteChildButton: React.FC<DeleteChildButton> = ({ id, displayName }) => {
  const { t } = useTranslation();
  const mutation = useDeleteChild();
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey({}) });
  };

  const config = {
    id,
    texts: createDeleteTexts(t, {
      entityName: t("child"),
      customTexts: {
        confirmation: displayName
          ? {
              title: t("delete.child.title", {
                name: displayName,
                defaultValue: `Remove child '{{name}}'`,
              }),
              message: t("delete.child.message", {
                name: displayName,
                defaultValue:
                  "Are you sure you want to permanently remove the child '{{name}}'? This action cannot be undone and all related data will be lost.",
              }),
            }
          : undefined,
        errors: displayName
          ? {
              conflict: t("delete.child.errors.conflict", {
                name: displayName,
                defaultValue: "Unable to remove child '{{name}}'.",
              }),
            }
          : undefined,
        success: displayName
          ? t("delete.child.success", {
              name: displayName,
              defaultValue: "Child '{{name}}' was successfully removed.",
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
