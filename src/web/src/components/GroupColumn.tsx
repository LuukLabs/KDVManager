import { Box, Paper, Typography, CircularProgress, useTheme, useMediaQuery } from "@mui/material";
import { type Dayjs } from "dayjs";
import { useGetSchedulesByDate } from "@api/endpoints/schedules/schedules";
import ChildCard from "./ChildCard";
import GroupSummary from "./GroupSummary";
import { useTranslation } from "react-i18next";
import { Groups as GroupsIcon, EventBusy as EventBusyIcon } from "@mui/icons-material";

type Group = {
  id: string;
  name: string;
};

type GroupColumnProps = {
  group: Group;
  selectedDate: Dayjs;
  absentChildIds?: string[];
  isClosed?: boolean;
  closureReason?: string | null;
};

const GroupColumn = ({
  group,
  selectedDate,
  absentChildIds = [],
  isClosed = false,
  closureReason,
}: GroupColumnProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { data: schedules, isLoading } = useGetSchedulesByDate({
    date: selectedDate.format("YYYY-MM-DD"),
    groupId: group.id,
  });

  const sortedSchedules = (schedules ?? []).sort((a, b) => {
    const nameA = (a.childFullName ?? "").toLocaleLowerCase();
    const nameB = (b.childFullName ?? "").toLocaleLowerCase();
    if (nameA && nameB) return nameA.localeCompare(nameB);
    if (nameA) return -1;
    if (nameB) return 1;
    return (a.childId ?? "").localeCompare(b.childId ?? "");
  });

  const present = sortedSchedules.filter((s) => !absentChildIds.includes(s.childId ?? ""));
  const absent = sortedSchedules.filter((s) => absentChildIds.includes(s.childId ?? ""));

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        height: "fit-content",
        minHeight: { xs: 200, md: 250 },
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        boxShadow: 1,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 3,
        },
      }}
    >
      {/* Group Header */}
      <Box
        sx={{
          mb: 2,
          pb: 1.5,
          borderBottom: "2px solid",
          borderColor: "primary.main",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{
              fontWeight: 700,
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <GroupsIcon />
            {group.name}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}
        >
          {selectedDate.format("dddd, MMMM D")}
        </Typography>
      </Box>

      {/* Group Summary (hidden on closed days) */}
      {!isClosed && (
        <GroupSummary groupId={group.id} selectedDate={selectedDate} absentCount={absent.length} />
      )}

      {isClosed && (
        <Box
          sx={{
            mt: 1,
            mb: 2,
            p: 1,
            border: "1px solid",
            borderColor: "warning.light",
            background: "linear-gradient(135deg, #fff3e0 0%, #fffaf2 100%)",
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <EventBusyIcon sx={{ color: "warning.main" }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: "warning.main" }}>
            {closureReason ?? t("Closed")}
          </Typography>
        </Box>
      )}

      {/* Content hidden entirely when closed */}
      {isClosed ? null : isLoading ? (
        <Box
          sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4, flex: 1 }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={32} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              {t("Loading schedules...")}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {(present.length > 0 || absent.length > 0) && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1, md: 1.25 } }}>
              {present.map((schedule) => (
                <ChildCard
                  key={schedule.scheduleId}
                  childId={schedule.childId ?? ""}
                  schedule={schedule}
                />
              ))}
              {absent.length > 0 && present.length > 0 && (
                <Box sx={{ borderTop: "1px dashed", borderColor: "divider", my: 0.5 }} />
              )}
              {absent.map((schedule) => (
                <Box key={schedule.scheduleId} sx={{ opacity: 0.5 }}>
                  <ChildCard childId={schedule.childId ?? ""} schedule={schedule} />
                </Box>
              ))}
            </Box>
          )}

          {present.length === 0 && absent.length === 0 && (
            <Box
              sx={{
                textAlign: "center",
                py: { xs: 3, md: 4 },
                px: 2,
                backgroundColor: "grey.50",
                borderRadius: 2,
                border: "2px dashed",
                borderColor: "grey.300",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box>
                <EventBusyIcon
                  sx={{ fontSize: { xs: 40, md: 48 }, color: "text.secondary", mb: 1 }}
                />
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                  {t("No schedules for this date")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}
                >
                  {t("Children will appear here when scheduled")}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default GroupColumn;
