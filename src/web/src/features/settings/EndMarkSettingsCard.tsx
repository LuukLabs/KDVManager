import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  useGetEndMarkSettings,
  useUpdateEndMarkSettings,
} from "../../api/endpoints/end-mark-settings/end-mark-settings";
import type { UpdateEndMarkSettingsCommand } from "../../api/models/updateEndMarkSettingsCommand";

export const EndMarkSettingsCard: React.FC = () => {
  const { t } = useTranslation();

  // API hooks
  const { data: settings, isLoading, error, refetch } = useGetEndMarkSettings();
  const updateMutation = useUpdateEndMarkSettings();

  // Form state
  const [formData, setFormData] = useState<UpdateEndMarkSettingsCommand>({
    isEnabled: settings?.isEnabled ?? false,
    yearsAfterBirth: settings?.yearsAfterBirth ?? 5,
    description: settings?.description ?? "EndMark for {childName} born on {birthDate}",
  });

  // Track if form has been modified
  const [isModified, setIsModified] = useState(false);

  // Update form data when settings are loaded
  React.useEffect(() => {
    if (settings) {
      const newFormData = {
        isEnabled: settings.isEnabled ?? false,
        yearsAfterBirth: settings.yearsAfterBirth ?? 5,
        description: settings.description ?? "EndMark for {childName} born on {birthDate}",
      };
      setFormData(newFormData);
      setIsModified(false);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ data: formData });
      await refetch();
      setIsModified(false);
    } catch (error) {
      console.error("Failed to update EndMark settings:", error);
    }
  };

  const handleInputChange =
    (field: keyof UpdateEndMarkSettingsCommand) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "isEnabled"
          ? event.target.checked
          : field === "yearsAfterBirth"
            ? parseInt(event.target.value, 10) || 0
            : event.target.value;

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      setIsModified(true);
    };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{t("Failed to load EndMark settings. Please try again.")}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" mb={2}>
          {t("EndMark Automation Settings")}
        </Typography>

        {updateMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t("Failed to update settings. Please try again.")}
          </Alert>
        )}

        <Box component="form" display="flex" flexDirection="column" gap={3}>
          <FormControlLabel
            control={
              <Switch checked={formData.isEnabled} onChange={handleInputChange("isEnabled")} />
            }
            label={t("Enable automatic EndMark creation")}
          />

          <TextField
            label={t("Years after birth")}
            type="number"
            value={formData.yearsAfterBirth}
            onChange={handleInputChange("yearsAfterBirth")}
            inputProps={{ min: 0, max: 50 }}
            helperText={t("Number of years after birth to create the EndMark")}
            fullWidth
          />

          <TextField
            label={t("Description template")}
            value={formData.description}
            onChange={handleInputChange("description")}
            multiline
            rows={3}
            helperText={t(
              "Description for automatically created EndMarks. Use {childName} and {birthDate} as placeholders.",
            )}
            fullWidth
            inputProps={{ maxLength: 500 }}
          />

          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!isModified || updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                t("Save")
              )}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
