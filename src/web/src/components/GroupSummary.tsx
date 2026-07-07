import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  IconButton,
  Divider,
  CircularProgress,
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
      <Card
        sx={{
          mb: 2,
          borderRadius: 2,
          boxShadow: 2,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.16),
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${theme.palette.background.paper} 100%)`,
        }}
      >
        <CardContent
          sx={{
            p: { xs: 1.5, sm: 2 },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 120,
          }}
        >
          <CircularProgress size={24} />
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              ml: 2,
            }}
          >
            {t("Loading summary...")}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        sx={{
          mb: 2,
          borderRadius: 2,
          boxShadow: 2,
          border: "1px solid",
          borderColor: alpha(theme.palette.error.main, 0.24),
        }}
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
      <Card
        sx={{
          mb: 2,
          borderRadius: 2,
          boxShadow: 2,
          border: "1px solid",
          borderColor: "grey.200",
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${theme.palette.background.paper} 100%)`,
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              textAlign: "center",
              mb: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Schedule />
            {t("Daily Summary")}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            {t("No children scheduled for this day")}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: 2,
        border: "1px solid",
        borderColor: alpha(theme.palette.primary.main, 0.16),
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
        {/* Header Section */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              textAlign: "center",
              mb: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Schedule />
            {t("Daily Summary")}
          </Typography>

          {/* Summary Stats */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
            <Chip
              icon={<ChildCare />}
              label={`${summary.numberOfChildren} ${t("children")}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            {absentCount > 0 && (
              <Chip
                icon={<PersonOff />}
                label={absentCount}
                size="small"
                variant="outlined"
                color="warning"
                sx={{ fontWeight: 600 }}
              />
            )}
            <Chip
              icon={<SupervisorAccount />}
              label={
                summary.requiredProfessionals != null
                  ? `${summary.requiredProfessionals} ${t("supervisors")}`
                  : t("Ratio requirement cannot be met")
              }
              size="small"
              color={summary.requiredProfessionals != null ? "secondary" : "error"}
              variant="outlined"
              sx={{ fontWeight: 600 }}
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
                backgroundColor: "rgba(25, 118, 210, 0.04)",
                border: "1px solid",
                borderColor: "rgba(25, 118, 210, 0.12)",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                  borderColor: "primary.main",
                  transform: "translateX(2px)",
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
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                      fontFamily: "monospace",
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
                        color: "success.main",
                        fontWeight: 500,
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
                        color: block.requiredProfessionals != null ? "warning.main" : "error.main",
                        fontWeight: 500,
                      }}
                    >
                      <SupervisorAccount sx={{ fontSize: 12 }} />
                      {block.requiredProfessionals ?? t("Ratio requirement cannot be met")}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <IconButton
                size="small"
                onClick={() => handleOpenDetails(block)}
                sx={{
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
