import { useState } from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useTranslation } from "react-i18next";
import { useListGroups } from "@api/endpoints/groups/groups";
import GroupColumn from "../components/GroupColumn";

dayjs.extend(utc);

const DATE_FORMAT = "MMMM D, YYYY";

const ScheduleOverviewPage = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs().utc());
  const { t, i18n } = useTranslation();

  const { data, isLoading: isLoadingGroups } = useListGroups();
  const groups = data?.value || [];

  if (isLoadingGroups) return <div>{t("Loading groups...")}</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Title - Full Width */}
        <Grid size={12}>
          <Typography variant="h4">
            {t("Schedule Overview")} - {selectedDate.locale(i18n.language).format(DATE_FORMAT)}
          </Typography>
        </Grid>

        {/* Groups Section with Horizontal Scroll */}
        <Grid size={{ xs: 12, lg: 9 }}>
          {!groups || groups.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
              {t("No groups found")}
            </Typography>
          ) : (
            <Box
              sx={{
                display: "flex",
                gap: 3,
                overflowX: "auto",
                pb: 1,
                "&::-webkit-scrollbar": {
                  height: 8,
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "grey.100",
                  borderRadius: 4,
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "grey.400",
                  borderRadius: 4,
                  "&:hover": {
                    backgroundColor: "grey.500",
                  },
                },
              }}
            >
              {groups.map((group) => (
                <Box
                  key={group.id}
                  sx={{
                    minWidth: 400,
                    maxWidth: 400,
                    flexShrink: 0,
                  }}
                >
                  <GroupColumn group={group} selectedDate={selectedDate} />
                </Box>
              ))}
            </Box>
          )}
        </Grid>

        {/* Calendar - Fixed Position */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <Paper sx={{ p: 2 }}>
            <DateCalendar
              value={selectedDate}
              onChange={(newValue) => newValue && setSelectedDate(newValue.utc())}
              sx={{ width: "100%", maxWidth: 300 }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export const Component = ScheduleOverviewPage;
