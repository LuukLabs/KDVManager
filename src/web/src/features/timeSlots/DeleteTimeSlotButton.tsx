import { useTranslation } from "react-i18next";
import { getListTimeSlotsQueryKey, useDeleteTimeSlot } from "@api/endpoints/time-slots/time-slots";
import { useQueryClient } from "@tanstack/react-query";
import { IconDeleteButton } from "@components/delete/IconDeleteButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { createDeleteTexts } from "@utils/createDeleteTexts";

type DeleteTimeSlotButtonProps = {
  id: string;
  displayName?: string;
};

export const DeleteTimeSlotButton = ({ id, displayName }: DeleteTimeSlotButtonProps) => {
  const { t } = useTranslation();
  const mutation = useDeleteTimeSlot();
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: getListTimeSlotsQueryKey() });
  };

  const config = {
    id,
    texts: createDeleteTexts(t, {
      entityName: t("timeSlot", { defaultValue: "time slot" }),
      customTexts: displayName
        ? {
            confirmation: {
              title: t("delete.timeSlot.title", {
                name: displayName,
                defaultValue: "Remove time slot '{{name}}'",
              }),
              message: t("delete.timeSlot.message", {
                name: displayName,
                defaultValue:
                  "Are you sure you want to permanently remove the time slot '{{name}}'? This action cannot be undone.",
              }),
            },
            errors: {
              conflict: t("delete.timeSlot.errors.conflict", {
                name: displayName,
                defaultValue:
                  "Unable to remove time slot '{{name}}' because it is currently used in schedules. Remove all dependencies first.",
              }),
            },
            success: t("delete.timeSlot.success", {
              name: displayName,
              defaultValue: "Time slot '{{name}}' was successfully removed.",
            }),
          }
        : undefined,
    }),
    onSuccess: handleSuccess,
  };

  return (
    <IconDeleteButton mutation={mutation} config={config} size="small">
      <DeleteIcon fontSize="small" />
    </IconDeleteButton>
  );
};

export default DeleteTimeSlotButton;
