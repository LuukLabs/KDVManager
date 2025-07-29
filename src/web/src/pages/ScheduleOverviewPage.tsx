import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
  Fab,
  Drawer,
  IconButton,
  AppBar,
  Toolbar,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import {
  CalendarMonth as CalendarIcon,
  Close as CloseIcon,
  Today as TodayIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Groups as GroupsIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useTranslation } from "react-i18next";
import { useListGroups } from "@api/endpoints/groups/groups";
import GroupColumn from "../components/GroupColumn";
import { useSearchParams } from "react-router-dom";

dayjs.extend(utc);

const ScheduleOverviewPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Get date from URL parameter or default to today
  const getInitialDate = () => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const parsedDate = dayjs(dateParam);
      if (parsedDate.isValid()) {
        return parsedDate; // Keep as local time for calendar
      }
    }
    return dayjs(); // Local time for calendar
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate);

  // Update URL when date changes
  const handleDateChange = (newDate: dayjs.Dayjs | null) => {
    if (newDate) {
      setSelectedDate(newDate); // Store as local time for calendar

      // Update URL search params with date-only format
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("date", newDate.format("YYYY-MM-DD"));
      setSearchParams(newSearchParams, { replace: true });
    }
  };

  // Update state when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const parsedDate = dayjs(dateParam);
      if (parsedDate.isValid()) {
        setSelectedDate(parsedDate); // Keep as local time for calendar
      }
    }
  }, [searchParams]);

  const { data, isLoading: isLoadingGroups } = useListGroups();
  const groups = data?.value ?? [];

  // Date navigation helpers
  const goToPreviousDay = () => {
    handleDateChange(selectedDate.subtract(1, "day"));
  };

  const goToNextDay = () => {
    handleDateChange(selectedDate.add(1, "day"));
  };

  const goToToday = () => {
    handleDateChange(dayjs());
  };

  // Calendar drawer handlers
  const handleOpenCalendar = () => {
    setIsCalendarOpen(true);
  };

  const handleCloseCalendar = () => {
    setIsCalendarOpen(false);
  };

  const handleCalendarDateChange = (newDate: dayjs.Dayjs | null) => {
    if (newDate) {
      handleDateChange(newDate);
      setIsCalendarOpen(false);
    }
  };

  if (isLoadingGroups) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Typography variant="h6">{t("Loading groups...")}</Typography>
      </Box>
    );
  }

  const todayIsSelected = selectedDate.isSame(dayjs(), "day");

  return (
    <Box sx={{ pb: isMobile ? 2 : 0 }}>
      {/* Mobile Header with Date Controls */}
      {isMobile && (
        <Paper sx={{ mb: 2, p: 2 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}
          >
            <IconButton onClick={goToPreviousDay} size="small">
              <ChevronLeftIcon />
            </IconButton>

            <Box sx={{ textAlign: "center", flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedDate.locale(i18n.language).format("dddd")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedDate.locale(i18n.language).format("MMMM D, YYYY")}
              </Typography>
              {todayIsSelected && (
                <Chip label={t("Today")} size="small" color="primary" sx={{ mt: 0.5 }} />
              )}
            </Box>

            <IconButton onClick={goToNextDay} size="small">
              <ChevronRightIcon />
            </IconButton>
          </Box>

          <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<TodayIcon />}
              onClick={goToToday}
              disabled={todayIsSelected}
            >
              {t("Today")}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CalendarIcon />}
              onClick={handleOpenCalendar}
            >
              {t("Calendar")}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Desktop Layout */}
      <Grid container spacing={3}>
        {/* Desktop Title and Date Controls */}
        {!isMobile && (
          <Grid size={12}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {t("Schedule Overview")}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<TodayIcon />}
                  onClick={goToToday}
                  disabled={todayIsSelected}
                >
                  {t("Today")}
                </Button>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                <IconButton onClick={goToPreviousDay}>
                  <ChevronLeftIcon />
                </IconButton>

                <Box sx={{ textAlign: "center", minWidth: 300 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedDate.locale(i18n.language).format("dddd, MMMM D, YYYY")}
                  </Typography>
                  {todayIsSelected && (
                    <Chip label={t("Today")} size="small" color="primary" sx={{ mt: 1 }} />
                  )}
                </Box>

                <IconButton onClick={goToNextDay}>
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Groups Section */}
        <Grid size={{ xs: 12, lg: 9 }}>
          {!groups || groups.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <GroupsIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" gutterBottom color="text.secondary">
                {t("No groups found")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t("Create groups to start managing schedules")}
              </Typography>
              <Button variant="contained" startIcon={<GroupsIcon />}>
                {t("Create Group")}
              </Button>
            </Paper>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? 2 : 3,
                overflowX: isMobile ? "visible" : "auto",
                pb: isMobile ? 0 : 1,
                "&::-webkit-scrollbar": !isMobile
                  ? {
                      height: 8,
                    }
                  : undefined,
                "&::-webkit-scrollbar-track": !isMobile
                  ? {
                      backgroundColor: "grey.100",
                      borderRadius: 4,
                    }
                  : undefined,
                "&::-webkit-scrollbar-thumb": !isMobile
                  ? {
                      backgroundColor: "grey.400",
                      borderRadius: 4,
                      "&:hover": {
                        backgroundColor: "grey.500",
                      },
                    }
                  : undefined,
              }}
            >
              {groups.map((group) => (
                <Box
                  key={group.id}
                  sx={{
                    minWidth: isMobile ? "100%" : 350,
                    maxWidth: isMobile ? "100%" : 400,
                    flexShrink: 0,
                  }}
                >
                  <GroupColumn
                    group={{ id: group.id ?? "", name: group.name ?? "" }}
                    selectedDate={selectedDate}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Grid>

        {/* Desktop Calendar */}
        {!isMobile && (
          <Grid size={{ xs: 12, lg: 3 }}>
            <Paper sx={{ p: 2, position: "sticky", top: 20 }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                {t("Calendar")}
              </Typography>
              <DateCalendar
                value={selectedDate}
                onChange={handleDateChange}
                sx={{ width: "100%", maxWidth: 320 }}
              />
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Mobile Calendar Drawer */}
      <Drawer
        anchor="bottom"
        open={isCalendarOpen}
        onClose={handleCloseCalendar}
        sx={{
          "& .MuiDrawer-paper": {
            borderRadius: "16px 16px 0 0",
            maxHeight: "80vh",
          },
        }}
      >
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar>
            <Typography variant="h6" sx={{ flex: 1 }}>
              {t("Select Date")}
            </Typography>
            <IconButton onClick={handleCloseCalendar}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <DateCalendar
            value={selectedDate}
            onChange={handleCalendarDateChange}
            sx={{ width: "100%", maxWidth: 350 }}
          />
        </Box>
      </Drawer>

      {/* Mobile Floating Action Button (alternative) */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label={t("open calendar")}
          onClick={handleOpenCalendar}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            display: { xs: "flex", md: "none" },
            zIndex: 1000,
          }}
        >
          <CalendarIcon />
        </Fab>
      )}
    </Box>
  );
};

export const Component = ScheduleOverviewPage;
