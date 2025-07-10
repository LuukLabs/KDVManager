import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Avatar,
  CardActionArea,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Schedule, AccessTime, Person } from "@mui/icons-material";
import { useGetChildById } from "@api/endpoints/children/children";
import type { ScheduleByDateVM } from "@api/models/scheduleByDateVM";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

type ChildCardProps = {
  childId: string;
  schedule: ScheduleByDateVM;
};

const ChildCard = ({ childId, schedule }: ChildCardProps) => {
  const { data: childDetails, isLoading: isLoadingChild } = useGetChildById(childId);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return t("N/A");
    const years = dayjs().diff(dayjs(dateOfBirth), "year");
    return years === 1 ? `${years} ${t("year")}` : `${years} ${t("years")}`;
  };

  const getFullName = () => {
    if (childDetails?.givenName && childDetails?.familyName) {
      return `${childDetails.givenName} ${childDetails.familyName}`.trim();
    }
    return schedule.childFullName || t("Unknown Child");
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
    return "?";
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    return dayjs(`2000-01-01T${time}`).format("HH:mm");
  };

  const handleCardClick = () => {
    navigate(`/children/${childId}`);
  };

  const getAvatarColor = () => {
    // Generate consistent color based on child ID
    const colors = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#c2185b', '#00796b'];
    let hash = 0;
    for (let i = 0; i < childId.length; i++) {
      hash = ((hash << 5) - hash + childId.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Card
      sx={{
        transition: "all 0.2s ease-in-out",
        border: '1px solid',
        borderColor: 'divider',
        "&:hover": {
          boxShadow: 2,
          transform: 'translateY(-1px)',
          cursor: "pointer",
          borderColor: 'primary.main',
        },
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      <CardActionArea onClick={handleCardClick}>
        <CardContent sx={{ p: { xs: 1, sm: 1.5 }, "&:last-child": { pb: { xs: 1, sm: 1.5 } } }}>
          {isLoadingChild ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minHeight: 48 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                {t("Loading child details...")}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 1 }}>
              {/* Left section - Avatar and Name */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
                <Avatar
                  sx={{
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    bgcolor: getAvatarColor(),
                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                    fontWeight: "bold",
                    flexShrink: 0,
                    boxShadow: 1,
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
                      fontSize: { xs: "0.85rem", sm: "0.9rem" },
                      color: 'text.primary',
                      mb: 0.25,
                    }}
                  >
                    {getFullName()}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ 
                      fontSize: { xs: "0.7rem", sm: "0.75rem" }, 
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.25
                    }}
                  >
                    <Person sx={{ fontSize: 12 }} />
                    {calculateAge(childDetails?.dateOfBirth || null)}
                  </Typography>
                </Box>
              </Box>

              {/* Right section - Schedule Info */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: isMobile ? "row" : "column",
                  alignItems: isMobile ? "center" : "flex-end",
                  gap: 0.75,
                  minWidth: 0,
                  flex: isMobile ? 1 : "0 0 auto",
                }}
              >
                {/* Time Slot Badge */}
                <Chip
                  icon={<Schedule sx={{ fontSize: 14 }} />}
                  label={schedule.timeSlotName || t("No time slot")}
                  size="small"
                  sx={{
                    backgroundColor: 'primary.50',
                    color: 'primary.dark',
                    borderColor: 'primary.200',
                    border: '1px solid',
                    fontWeight: 600,
                    fontSize: { xs: "0.65rem", sm: "0.7rem" },
                    height: { xs: 24, sm: 28 },
                    maxWidth: { xs: "auto", sm: 120 },
                  }}
                />

                {/* Time Display */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.25,
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 1,
                    backgroundColor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  <AccessTime sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.65rem", sm: "0.7rem" },
                        color: "success.main",
                        fontFamily: "monospace",
                      }}
                    >
                      {formatTime(schedule.startTime || "")}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: "0.6rem", sm: "0.65rem" },
                        color: "text.secondary",
                      }}
                    >
                      →
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.65rem", sm: "0.7rem" },
                        color: "error.main",
                        fontFamily: "monospace",
                      }}
                    >
                      {formatTime(schedule.endTime || "")}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ChildCard;
