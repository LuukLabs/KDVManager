import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Chip,
  Card,
  CardContent,
  IconButton,
  Divider,
  TableHead,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  AccessTime,
  People,
  SupervisorAccount,
  VisibilityOutlined,
  Schedule,
  ChildCare,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import type dayjs from "dayjs";
import { useGetGroupSummary } from "@api/endpoints/schedules/schedules";
import { type TimeBlockSummary } from "@api/models/timeBlockSummary";

type GroupSummaryProps = {
  groupId: string;
  selectedDate: dayjs.Dayjs;
};

const GroupSummary = ({ groupId, selectedDate }: GroupSummaryProps) => {
  const { t } = useTranslation();
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
          borderColor: "primary.100",
          background: "linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)",
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
          <Typography variant="body2" sx={{ ml: 2 }} color="text.secondary">
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
          borderColor: "error.200",
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
          background: "linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)",
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
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {t("No children scheduled for this day")}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const totalChildren = summary.timeBlocks.reduce(
    (sum: number, block: TimeBlockSummary) => sum + block.totalChildren,
    0,
  );
  const totalSupervisors = summary.timeBlocks.reduce(
    (sum: number, block: TimeBlockSummary) => sum + block.requiredSupervisors,
    0,
  );

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: 2,
        border: "1px solid",
        borderColor: "primary.100",
        background: "linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)",
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
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 2 }}>
            <Chip
              icon={<ChildCare />}
              label={`${totalChildren} ${t("children")}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={<SupervisorAccount />}
              label={`${totalSupervisors} ${t("supervisors")}`}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Divider />
        </Box>

        {/* Time Blocks */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {summary.timeBlocks.map((block: TimeBlockSummary, index: number) => (
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
                        color: "warning.main",
                        fontWeight: 500,
                      }}
                    >
                      <SupervisorAccount sx={{ fontSize: 12 }} />
                      {block.requiredSupervisors}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <IconButton
                size="small"
                onClick={() => handleOpenDetails(block)}
                sx={{
                  backgroundColor: "primary.50",
                  border: "1px solid",
                  borderColor: "primary.200",
                  "&:hover": {
                    backgroundColor: "primary.100",
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
        <Dialog
          open={!!selectedTimeBlock}
          onClose={handleCloseDetails}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: 3,
            },
          }}
        >
          <DialogTitle
            sx={{
              textAlign: "center",
              pb: 1,
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <AccessTime />
            {selectedTimeBlock?.timeSlotName}
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                {t("Overview")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Chip
                  icon={<ChildCare />}
                  label={`${selectedTimeBlock?.totalChildren} ${t("children")}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<SupervisorAccount />}
                  label={`${selectedTimeBlock?.requiredSupervisors} ${t("supervisors needed")}`}
                  color="secondary"
                  variant="outlined"
                />
              </Box>
            </Box>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              {t("Age Group Distribution")}
            </Typography>

            <Table size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>{t("Age Group")}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {t("Count")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedTimeBlock?.ageGroups &&
                  selectedTimeBlock.ageGroups.map((ageGroup, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": { backgroundColor: "grey.50" },
                        "&:last-child td": { border: 0 },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <ChildCare sx={{ fontSize: 16, color: "primary.main" }} />
                          {ageGroup.ageRange}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={ageGroup.childCount}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 600, minWidth: 40 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </DialogContent>

          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={handleCloseDetails} variant="outlined" sx={{ borderRadius: 2 }}>
              {t("Close")}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default GroupSummary;
