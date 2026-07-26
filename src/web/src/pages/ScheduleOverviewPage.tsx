import { Box, Paper, Typography, Alert, IconButton, Button, Stack, Chip } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Today as TodayIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Groups as GroupsIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import GroupColumn from "../components/GroupColumn";
import { useDayBoard } from "@features/attendance/useDayBoard";
import { emptyStatusCounts } from "@features/attendance/types";
import { formatDayHeading } from "@utils/formatDate";

const GROUPS_SETTINGS_PATH = "/settings/groups";

const ScheduleOverviewPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();

  // The URL is the single source of truth for the day, so a board is shareable.
  const dateParam = searchParams.get("date");
  const selectedDate = dateParam && dayjs(dateParam).isValid() ? dayjs(dateParam) : dayjs();

  const handleDateChange = (newDate: dayjs.Dayjs | null) => {
    if (!newDate?.isValid()) return;
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("date", newDate.format("YYYY-MM-DD"));
    setSearchParams(newSearchParams, { replace: true });
  };

  const board = useDayBoard(selectedDate);
  const todayIsSelected = board.isToday;
  const hasGroups = board.groups.length > 0;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        // Bound the page so each column scrolls its own roster rather than the
        // whole document. This has to come before the columns' sticky heads:
        // overflow-x on an ancestor would make them stick to the box instead.
        height: { md: "calc(100vh - 128px)" },
        minHeight: 0,
      }}
    >
      {/* One header at every width — the same markup reflows, instead of two
          copies unmounting each other across 900px. */}
      <Paper variant="outlined" sx={{ p: 2, flexShrink: 0 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ alignItems: { xs: "stretch", md: "center" }, justifyContent: "space-between" }}
        >
          <Typography variant="h5" component="h1">
            {t("Schedule Overview")}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", justifyContent: { xs: "space-between", md: "flex-end" } }}
          >
            <IconButton
              onClick={() => handleDateChange(selectedDate.subtract(1, "day"))}
              aria-label={t("Previous day")}
              data-testid="schedule-previous-day"
              sx={{ width: 44, height: 44 }}
            >
              <ChevronLeftIcon />
            </IconButton>

            {/* Replaces a fixed FAB whose Popper had no Escape, no focus trap and
                no focus restore. MUI supplies all three. */}
            <Box data-testid="schedule-date-picker" sx={{ flex: { xs: 1, sm: "0 0 auto" } }}>
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                format="dddd LL"
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { width: { xs: "100%", sm: 250 } },
                  },
                }}
              />
            </Box>

            <IconButton
              onClick={() => handleDateChange(selectedDate.add(1, "day"))}
              aria-label={t("Next day")}
              data-testid="schedule-next-day"
              sx={{ width: 44, height: 44 }}
            >
              <ChevronRightIcon />
            </IconButton>

            <Button
              variant="outlined"
              startIcon={<TodayIcon />}
              onClick={() => handleDateChange(dayjs())}
              disabled={todayIsSelected}
            >
              {t("Today")}
            </Button>
          </Stack>
        </Stack>

        {/* Stepping a day is a silent change for a screen reader unless the day
            that arrived is announced. */}
        <Box
          role="status"
          aria-live="polite"
          aria-atomic="true"
          sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {formatDayHeading(selectedDate, i18n.language)}
          </Typography>
          {todayIsSelected && <Chip label={t("Today")} size="small" color="primary" />}
        </Box>
      </Paper>

      {/* Stated once for the day, instead of once per group column. */}
      {board.isClosed && (
        <Alert severity="warning" sx={{ flexShrink: 0 }}>
          {board.closureReason ?? t("Closed")}
        </Alert>
      )}

      {board.isError && (
        <Alert severity="error" sx={{ flexShrink: 0 }}>
          {t("Error loading")}
        </Alert>
      )}

      {!hasGroups && !board.isLoading ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <GroupsIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
          <Typography variant="h6" gutterBottom sx={{ color: "text.secondary" }}>
            {t("No groups found")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            {t("Create groups to start managing schedules")}
          </Typography>
          <Button
            variant="contained"
            startIcon={<GroupsIcon />}
            component={RouterLink}
            to={GROUPS_SETTINGS_PATH}
          >
            {t("Create Group")}
          </Button>
        </Paper>
      ) : (
        // Nothing here is a timeline, so the groups wrap rather than hiding
        // behind a horizontal scroll with a webkit-only affordance.
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fill, minmax(320px, 1fr))" },
            gap: 2,
            flex: 1,
            minHeight: 0,
            overflowY: { md: "auto" },
            alignContent: "start",
          }}
        >
          {board.isLoading && !hasGroups
            ? [0, 1, 2].map((i) => (
                <GroupColumn
                  key={i}
                  board={{
                    groupId: "",
                    groupName: "",
                    rows: [],
                    countsByStatus: emptyStatusCounts(),
                  }}
                  selectedDate={selectedDate}
                  isClosed
                  isLoading
                />
              ))
            : board.groups.map((group) => (
                <GroupColumn
                  key={group.groupId}
                  board={group}
                  selectedDate={selectedDate}
                  isClosed={board.isClosed}
                  isLoading={board.isLoading}
                />
              ))}
        </Box>
      )}
    </Box>
  );
};

export const Component = ScheduleOverviewPage;
