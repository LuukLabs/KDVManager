import { Card, CardContent, Typography, Box, CircularProgress, Avatar } from "@mui/material";
import { Schedule } from "@mui/icons-material";
import { useGetChildById } from "@api/endpoints/children/children";
import type { ScheduleByDateVM } from "@api/models/scheduleByDateVM";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import AttendanceControl, { type AttendanceState } from "./AttendanceControl";

type ChildCardProps = {
  childId: string;
  schedule: ScheduleByDateVM;
};

const ChildCard = ({ childId, schedule }: ChildCardProps) => {
  const { data: childDetails, isLoading: isLoadingChild } = useGetChildById(childId);
  const { t } = useTranslation();

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return t("N/A");
    const years = dayjs().diff(dayjs(dateOfBirth), "year");
    return years === 1 ? `${years} ${t("year")}` : `${years} ${t("years")}`;
  };

  const getFullName = () => {
    if (childDetails?.givenName && childDetails?.familyName) {
      return `${childDetails.givenName} ${childDetails.familyName}`.trim();
    }
    return schedule.childFullName;
  };

  const getInitials = () => {
    if (childDetails?.givenName && childDetails?.familyName) {
      return `${childDetails.givenName[0]}${childDetails.familyName[0]}`.toUpperCase();
    }
    const fullName = schedule.childFullName;
    if (fullName) {
      const names = fullName.split(" ");
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : fullName[0].toUpperCase();
    }
    return "C";
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    return dayjs(`2000-01-01T${time}`).format("HH:mm");
  };

  const handleAttendanceChange = (state: AttendanceState) => {
    // Handle attendance state change (e.g., API call)
    console.log(`Attendance changed to: ${state}`);
  };

  return (
    <Card
      sx={{
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 2,
        },
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        {isLoadingChild ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Loading...</Typography>
          </Box>
        ) : (
          <Box>
            {/* Header with avatar and name */}
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 1.5 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "primary.main",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                }}
              >
                {getInitials()}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: 1.2,
                  }}
                >
                  {getFullName()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {calculateAge(childDetails?.dateOfBirth || null)}
                </Typography>
              </Box>
            </Box>

            {/* Time slot info - improved display */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: "primary.50",
                border: "1px solid",
                borderColor: "primary.100",
                mb: 1.5,
              }}
            >
              <Schedule sx={{ fontSize: 16, color: "primary.main" }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    display: "block",
                    color: "primary.dark",
                    lineHeight: 1.2,
                  }}
                >
                  {schedule.timeSlotName}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Attendance control */}
            <AttendanceControl onStateChange={handleAttendanceChange} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ChildCard;
