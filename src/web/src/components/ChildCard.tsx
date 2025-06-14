import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Avatar,
  Chip,
  IconButton,
  Fade,
} from "@mui/material";
import { CheckCircle, Cancel, Help } from "@mui/icons-material";
import { useGetChildById } from "@api/endpoints/children/children";
import type { ScheduleByDateVM } from "@api/models/scheduleByDateVM";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type ChildCardProps = {
  childId: string;
  schedule: ScheduleByDateVM;
};

type AttendanceState = "present" | "absent" | "unknown";

const ChildCard = ({ childId, schedule }: ChildCardProps) => {
  const { data: childDetails, isLoading: isLoadingChild } = useGetChildById(childId);
  const [attendanceState, setAttendanceState] = useState<AttendanceState>("unknown");
  const [isHovered, setIsHovered] = useState(false);
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
    // Parse time string and format to HH:mm
    return dayjs(`2000-01-01T${time}`).format("HH:mm");
  };

  const getAttendanceConfig = (state: AttendanceState) => {
    switch (state) {
      case "present":
        return {
          label: "Present",
          color: "success" as const,
          icon: <CheckCircle sx={{ fontSize: 16 }} />,
          bgColor: "success.50",
        };
      case "absent":
        return {
          label: "Absent",
          color: "error" as const,
          icon: <Cancel sx={{ fontSize: 16 }} />,
          bgColor: "error.50",
        };
      case "unknown":
      default:
        return {
          label: "Unknown",
          color: "default" as const,
          icon: <Help sx={{ fontSize: 16 }} />,
          bgColor: "grey.100",
        };
    }
  };

  const attendanceConfig = getAttendanceConfig(attendanceState);

  return (
    <Card
      sx={{
        transition: "all 0.2s ease-in-out",
        position: "relative",
        border: "2px solid",
        borderColor:
          attendanceState === "present"
            ? "success.main"
            : attendanceState === "absent"
              ? "error.main"
              : "grey.300",
        "&:hover": {
          boxShadow: 4,
          borderColor:
            attendanceState === "present"
              ? "success.dark"
              : attendanceState === "absent"
                ? "error.dark"
                : "primary.main",
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent sx={{ pb: 2 }}>
        {isLoadingChild ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="subtitle1">Loading child details...</Typography>
          </Box>
        ) : (
          <Box>
            {/* Header with avatar and attendance status */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 2 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "primary.main",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                }}
              >
                {getInitials()}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {getFullName()}
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                  {calculateAge(childDetails?.dateOfBirth || null)}
                </Typography>
              </Box>
              <Chip
                icon={attendanceConfig.icon}
                label={attendanceConfig.label}
                color={attendanceConfig.color}
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </Box>

            {/* Time slot info */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                p: 1.5,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "grey.300",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {schedule.timeSlotName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
              </Typography>
            </Box>

            {/* Hover controls */}
            <Fade in={isHovered}>
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  display: "flex",
                  gap: 0.5,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  boxShadow: 2,
                  p: 0.5,
                }}
              >
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => setAttendanceState("present")}
                  sx={{
                    bgcolor: attendanceState === "present" ? "success.100" : "transparent",
                    "&:hover": { bgcolor: "success.100" },
                  }}
                >
                  <CheckCircle sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setAttendanceState("absent")}
                  sx={{
                    bgcolor: attendanceState === "absent" ? "error.100" : "transparent",
                    "&:hover": { bgcolor: "error.100" },
                  }}
                >
                  <Cancel sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton
                  size="small"
                  color="default"
                  onClick={() => setAttendanceState("unknown")}
                  sx={{
                    bgcolor: attendanceState === "unknown" ? "grey.100" : "transparent",
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                >
                  <Help sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Fade>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ChildCard;
