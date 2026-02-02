import React from "react";
import { useTranslation } from "react-i18next";
import { calculateAge } from "@utils/calculateAge";
import dayjs from "dayjs";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import { Person as PersonIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import {
  ChildSchedulingStatus,
  type ChildSchedulingStatus as ChildSchedulingStatusType,
} from "@api/models/childSchedulingStatus";

type ChildHeaderProps = {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  group?: string;
  cid?: string;
  schedulingStatus?: ChildSchedulingStatusType;
  statusRelevantDate?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
  loading?: boolean;
  editMode?: boolean;
};

export const ChildHeader: React.FC<ChildHeaderProps> = ({
  firstName,
  lastName,
  dateOfBirth,
  group,
  schedulingStatus,
  statusRelevantDate,
  onEdit,
  onDelete,
  loading = false,
  editMode = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();

  const getFullName = () => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return t("Unknown Child");
  };

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return "?";
  };

  const getAgeDisplay = () => {
    if (!dateOfBirth) return t("N/A");
    const age = calculateAge(dateOfBirth);
    if (age === undefined) return t("N/A");
    return t("{{count}} years", { count: age });
  };

  const getStatusLabel = () => {
    switch (schedulingStatus) {
      case ChildSchedulingStatus.Active:
        return statusRelevantDate
          ? t("status.activeUntil", { date: dayjs(statusRelevantDate).format("DD/MM/YYYY") })
          : t("status.active");
      case ChildSchedulingStatus.Upcoming:
        return statusRelevantDate
          ? t("status.upcomingFrom", { date: dayjs(statusRelevantDate).format("DD/MM/YYYY") })
          : t("status.upcoming");
      case ChildSchedulingStatus.Past:
        return t("status.past");
      case ChildSchedulingStatus.NoPlanning:
      default:
        return t("status.noPlanning");
    }
  };

  const getStatusColor = () => {
    switch (schedulingStatus) {
      case ChildSchedulingStatus.Active:
        return alpha("#4caf50", 0.3);
      case ChildSchedulingStatus.Upcoming:
        return alpha("#2196f3", 0.3);
      case ChildSchedulingStatus.Past:
        return alpha("#9e9e9e", 0.3);
      case ChildSchedulingStatus.NoPlanning:
      default:
        return alpha("#ff9800", 0.3);
    }
  };

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: "white",
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: { xs: 0, md: 3 },
        mb: { xs: 2, md: 3 },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 80%, ${alpha("#fff", 0.12)} 0%, transparent 55%), 
                       radial-gradient(circle at 80% 20%, ${alpha("#fff", 0.07)} 0%, transparent 55%)`,
          pointerEvents: "none",
        },
        boxShadow: { xs: "none", md: theme.shadows[2] },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: isMobile ? "flex-start" : "center",
            gap: 2,
            flexDirection: isMobile ? "column" : "row",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <Avatar
              sx={{
                width: { xs: 56, md: 64 },
                height: { xs: 56, md: 64 },
                bgcolor: alpha("#fff", 0.22),
                color: "primary.main",
                fontSize: { xs: "1.35rem", md: "1.5rem" },
                fontWeight: "bold",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              {loading ? <PersonIcon /> : getInitials()}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  lineHeight: 1.15,
                  fontSize: isMobile ? "1.55rem" : "2rem",
                }}
              >
                {getFullName()}
              </Typography>

              <Typography
                variant="subtitle1"
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: ".85rem", sm: ".9rem", md: "1rem" },
                  mb: 1,
                  fontWeight: 500,
                  letterSpacing: 0.3,
                }}
              >
                {t("Child Record")} {group && `• ${t("Group")}: ${group}`}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label={getAgeDisplay()}
                  size="small"
                  sx={{
                    backgroundColor: alpha("#fff", 0.2),
                    color: "white",
                    "& .MuiChip-label": { fontWeight: 600 },
                  }}
                />
                {schedulingStatus !== undefined && (
                  <Chip
                    label={getStatusLabel()}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(),
                      color: "white",
                      "& .MuiChip-label": { fontWeight: 600 },
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Box>

          {/* Actions */}
          {!editMode && (
            <Stack direction={isMobile ? "row" : "row"} spacing={1} sx={{ mt: isMobile ? 2 : 0 }}>
              {onEdit && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={onEdit}
                  disabled={loading}
                  sx={{
                    borderColor: alpha("#fff", 0.5),
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: alpha("#fff", 0.1),
                    },
                  }}
                >
                  {t("Edit")}
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={onDelete}
                  disabled={loading}
                  sx={{
                    borderColor: alpha(theme.palette.error.main, 0.7),
                    color: theme.palette.error.main,
                    "&:hover": {
                      borderColor: theme.palette.error.main,
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                    },
                  }}
                >
                  {t("Delete")}
                </Button>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};
