import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

type FormActionsProps = {
  submitLabel: string;
  /** Route the cancel button links back to (usually the list page). */
  cancelTo?: string;
};

/** Right-aligned cancel/submit row shared by all full-page forms. */
export const FormActions = ({ submitLabel, cancelTo }: FormActionsProps) => {
  const { t } = useTranslation();
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
      {cancelTo && (
        <Button
          variant="outlined"
          color="inherit"
          component={RouterLink}
          to={cancelTo}
          disabled={isSubmitting}
        >
          {t("Cancel", { ns: "common" })}
        </Button>
      )}
      <Button type="submit" variant="contained" loading={isSubmitting} sx={{ minWidth: 120 }}>
        {submitLabel}
      </Button>
    </Box>
  );
};
