import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Chip,
} from "@mui/material";
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
};

const GroupColumn = ({ group, selectedDate }: GroupColumnProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { data: schedules, isLoading } = useGetSchedulesByDate({
    Date: selectedDate.format("YYYY-MM-DD"),
    GroupId: group.id,
  });

  const childrenCount = schedules?.length || 0;

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
          transform: "translateY(-1px)",
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
          {!isLoading && (
            <Chip
              label={`${childrenCount} ${childrenCount === 1 ? t("child") : t("children")}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: 600,
                borderRadius: 2,
              }}
            />
          )}
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}
        >
          {selectedDate.format("dddd, MMMM D")}
        </Typography>
      </Box>

      {/* Group Summary */}
      <GroupSummary groupId={group.id} selectedDate={selectedDate} />

      {/* Content */}
      {isLoading ? (
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1, md: 1.5 }, flex: 1 }}>
          {schedules && schedules.length > 0 ? (
            schedules.map((schedule) => (
              <ChildCard
                key={schedule.scheduleId}
                childId={schedule.childId || ""}
                schedule={schedule}
              />
            ))
          ) : (
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
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "grey.100",
                  borderColor: "grey.400",
                },
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
