import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  IconButton,
  Divider,
  Skeleton,
  Alert,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  AccessTime,
  People,
  SupervisorAccount,
  VisibilityOutlined,
  Schedule,
  ChildCare,
  PersonOff,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import type dayjs from "dayjs";
import { useGetGroupSummary } from "@api/scheduling/endpoints/schedules/schedules";
import { type TimeBlockSummary } from "@api/scheduling/models/timeBlockSummary";
import TimeBlockDetailsDialog from "./TimeBlockDetailsDialog";

type GroupSummaryProps = {
  groupId: string;
  selectedDate: dayjs.Dayjs;
  absentCount?: number;
};

const GroupSummary = ({ groupId, selectedDate, absentCount = 0 }: GroupSummaryProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<TimeBlockSummary | null>(null);

  // Format date for API call (DateOnly format: YYYY-MM-DD)
  const formattedDate = selectedDate.format("YYYY-MM-DD");

  const {
    data: summary,
    isLoading,
    error,
  } = useGetGroupSummary({
    groupId: groupId,
    date: formattedDate,
  });

  const handleOpenDetails = (timeBlock: TimeBlockSummary) => {
    setSelectedTimeBlock(timeBlock);
  };

  const handleCloseDetails = () => {
    setSelectedTimeBlock(null);
  };

  if (isLoading) {
    return (
      <Card variant="outlined" sx={{ mb: 1.5, borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="rounded" animation="wave" height={28} sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        variant="outlined"
        sx={{ mb: 1.5, borderRadius: 2, borderColor: alpha(theme.palette.error.main, 0.4) }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Alert severity="error" sx={{ border: "none", boxShadow: "none" }}>
            {t("Failed to load group summary")}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!summary || summary.timeBlocks.length === 0) {
    return (
      <Card variant="outlined" sx={{ mb: 1.5, borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography
            component="h3"
            variant="subtitle2"
            sx={{
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              mb: 0.5,
            }}
          >
            <Schedule fontSize="small" />
            {t("Daily Summary")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("No children scheduled for this day")}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{ mb: 1.5, borderRadius: 2 }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
        {/* Header Section */}
        <Box sx={{ mb: 2 }}>
          <Typography
            component="h3"
            variant="subtitle2"
            sx={{
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              mb: 1,
            }}
          >
            <Schedule fontSize="small" />
            {t("Daily Summary")}
          </Typography>

          {/* Summary Stats */}
          <Box sx={{ display: "flex", gap: 0.75, mb: 1.5, flexWrap: "wrap" }}>
            <Chip
              icon={<ChildCare />}
              label={t("{{count}} children", { count: summary.numberOfChildren })}
              size="small"
              color="primary"
              variant="outlined"
            />
            {absentCount > 0 && (
              <Chip
                icon={<PersonOff />}
                label={t("{{count}} reported absent", { count: absentCount })}
                size="small"
                variant="outlined"
                sx={{
                  color: theme.customColors.status.reportedAbsent,
                  borderColor: alpha(theme.customColors.status.reportedAbsent, 0.5),
                }}
              />
            )}
            <Chip
              icon={<SupervisorAccount />}
              label={
                summary.requiredProfessionals != null
                  ? t("{{count}} supervisors", { count: summary.requiredProfessionals })
                  : t("Ratio requirement cannot be met")
              }
              size="small"
              color={summary.requiredProfessionals != null ? "secondary" : "error"}
              variant="outlined"
            />
          </Box>

          <Divider />
        </Box>

        {/* Time Blocks */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {summary.timeBlocks?.map((block: TimeBlockSummary, index: number) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.12),
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  borderColor: "primary.main",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                <AccessTime sx={{ fontSize: 16, color: "primary.main" }} />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    {block.timeSlotName}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: "text.primary",
                        fontWeight: 600,
                      }}
                    >
                      <People sx={{ fontSize: 12 }} />
                      {block.totalChildren}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: block.requiredProfessionals != null ? "text.secondary" : "error.main",
                        fontWeight: 600,
                      }}
                    >
                      <SupervisorAccount sx={{ fontSize: 12 }} />
                      {block.requiredProfessionals ?? t("Ratio requirement cannot be met")}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <IconButton
                onClick={() => handleOpenDetails(block)}
                aria-label={t("View details")}
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.24),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.16),
                    borderColor: "primary.main",
                  },
                }}
              >
                <VisibilityOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}
        </Box>

        {/* Details Dialog */}
        <TimeBlockDetailsDialog timeBlock={selectedTimeBlock} onClose={handleCloseDetails} />
      </CardContent>
    </Card>
  );
};

export default GroupSummary;
