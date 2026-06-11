import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useTranslation } from "react-i18next";

export type FormActionsProps = {
  onCancel: () => void;
  isSubmitting?: boolean;
  cancelLabel?: string;
  submitLabel?: string;
};

/**
 * Standard cancel/submit action row for create/edit form pages.
 * The submit button triggers the surrounding `<Form>` submit handler.
 */
export const FormActions = ({
  onCancel,
  isSubmitting = false,
  cancelLabel,
  submitLabel,
}: FormActionsProps) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
      <Button variant="outlined" color="inherit" onClick={onCancel} disabled={isSubmitting}>
        {cancelLabel ?? t("Cancel", { ns: "common" })}
      </Button>
      <Button type="submit" variant="contained" loading={isSubmitting} sx={{ minWidth: 120 }}>
        {submitLabel ?? t("Save", { ns: "common" })}
      </Button>
    </Box>
  );
};
