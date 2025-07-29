import { useTranslation } from "react-i18next";
import { SettingsCard } from "../../features/settings/SettingsCard";
import Grid from "@mui/material/Grid";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import GroupsIcon from "@mui/icons-material/Groups";
import React from "react";

const SettingsPage = () => {
  const { t } = useTranslation();

  const settings = [
    {
      title: t("Scheduling"),
      description: t("Manage groups and timeslots."),
      navigateTo: "/settings/scheduling",
      icon: <CalendarMonth fontSize="large" />,
    },
    {
      title: t("Groups"),
      description: t("Manage groups."),
      navigateTo: "/settings/groups",
      icon: <GroupsIcon fontSize="large" />,
    },
    {
      title: t("Closure Periods"),
      description: t("Manage closure periods for scheduling."),
      navigateTo: "/settings/closure-periods",
      icon: <CalendarMonth fontSize="large" />,
    },
  ];

  return (
    <React.Fragment>
      <Grid container spacing={2}>
        {settings.map((setting, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <SettingsCard
              title={setting.title}
              description={setting.description}
              navigateTo={setting.navigateTo}
              icon={setting.icon}
            />
          </Grid>
        ))}
      </Grid>
    </React.Fragment>
  );
};

export const Component = SettingsPage;
