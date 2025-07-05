import { Card, CardContent, Typography, Box, CircularProgress, Avatar, CardActionArea } from "@mui/material";
import { Schedule } from "@mui/icons-material";
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

  const handleCardClick = () => {
    navigate(`/children/${childId}`);
  };

  return (
    <Card
      sx={{
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 2,
          cursor: "pointer",
        },
      }}
    >
      <CardActionArea onClick={handleCardClick}>
        <CardContent sx={{ p: 0.75, "&:last-child": { pb: 0.75 } }}>
          {isLoadingChild ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={14} />
              <Typography variant="body2" fontSize="0.7rem">Loading...</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Avatar */}
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: "primary.main",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  flexShrink: 0,
                }}
              >
                {getInitials()}
              </Avatar>

              {/* Name and age */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: 1.1,
                    fontSize: "0.85rem",
                  }}
                >
                  {getFullName()}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", lineHeight: 1 }}>
                  {calculateAge(childDetails?.dateOfBirth || null)}
                </Typography>
              </Box>

              {/* Time slot info with improved visualization */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: "primary.50",
                  border: "1px solid",
                  borderColor: "primary.100",
                  flexShrink: 0,
                  minWidth: 0,
                }}
              >
                <Schedule sx={{ fontSize: 14, color: "primary.main" }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: "primary.dark",
                      lineHeight: 1.1,
                      fontSize: "0.75rem",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {schedule.timeSlotName}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.25,
                      mt: 0.25,
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: "0.65rem", 
                        color: "success.main",
                        fontFamily: "monospace",
                      }}
                    >
                      {formatTime(schedule.startTime || "")}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: "0.6rem", 
                        color: "text.secondary",
                        mx: 0.25,
                      }}
                    >
                      →
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: "0.65rem", 
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
