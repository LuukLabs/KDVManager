import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import React from "react";

const SchedulingSettingsPage = () => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <Typography variant="h1" component="h1">
        {t("Scheduling settings page")}
      </Typography>
    </React.Fragment>
  );
};

export const Component = SchedulingSettingsPage;
