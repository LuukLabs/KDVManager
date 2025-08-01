import { type TFunction } from "i18next";
import { type DeleteTexts } from "../types/delete.types";
import { type DeepPartial } from "react-hook-form";

type CreateDeleteTextsOptions = {
  readonly entityName: string;
  readonly customTexts?: DeepPartial<DeleteTexts>;
};

export const createDeleteTexts = (
  t: TFunction<"translation", undefined>,
  { entityName, customTexts }: CreateDeleteTextsOptions,
): DeleteTexts => {
  const displayName = entityName.charAt(0).toUpperCase() + entityName.slice(1);

  const { confirmation, errors, ...rest } = customTexts ?? {};

  return {
    confirmation: {
      title: t("delete.confirmation.title", {
        entityName: entityName,
        defaultValue: `Delete {{entityName}}`,
      }),
      message: t("delete.confirmation.message", {
        entityName: entityName,
        defaultValue: `Are you sure you want to delete this {{entityName}}? This action cannot be undone.`,
      }),
      cancelButton: t("cancel", { defaultValue: "Cancel", ns: "common" }),
      deleteButton: t("delete", { defaultValue: "Delete", ns: "common" }),
      deletingButton: t("deleting", { defaultValue: "Deleting...", ns: "common" }),
      ...confirmation,
    },
    success: t("delete.success", {
      displayName: displayName,
      defaultValue: `{{displayName}} deleted successfully`,
    }),
    errors: {
      conflict: t("delete.errors.conflict", {
        displayName: displayName,
        defaultValue: `{{displayName}} is currently in use and cannot be deleted`,
      }),
      notFound: t("delete.errors.notFound", {
        displayName: displayName,
        defaultValue: `{{displayName}} not found`,
      }),
      unknown: t("common.errors.unknown", {
        defaultValue: "An unexpected error occurred",
      }),
      ...errors,
    },
    ariaLabel: t("delete.ariaLabel", {
      entityName: entityName,
      defaultValue: `Delete {{entityName}}`,
    }),
    ...rest,
  } as const;
};
