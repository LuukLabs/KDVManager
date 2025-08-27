import { useTranslation } from "react-i18next";
import { SettingsCard } from "../../features/settings/SettingsCard";
import { NextChildNumberCard } from "../../features/settings/NextChildNumberCard";
import Grid from "@mui/material/Grid";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import GroupsIcon from "@mui/icons-material/Groups";
import React from "react";

const SettingsPage = () => {
  const { t } = useTranslation();

  const settings = [
    {
      title: t("Time Slots"),
      description: t("Manage time slots for scheduling."),
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
      <Grid
        container
        spacing={2}
        columns={{ xs: 1, sm: 2, md: 4 }}
        sx={{ width: "100%", alignItems: "stretch" }}
      >
        <Grid size={1}>
          <NextChildNumberCard />
        </Grid>
        {settings.map((setting, index) => (
          <Grid key={index} size={1}>
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
