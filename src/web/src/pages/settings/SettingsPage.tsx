import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const SettingsPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="h2">{t("Settings")}</Typography>
    </>
  );
};

export const Component = SettingsPage;
