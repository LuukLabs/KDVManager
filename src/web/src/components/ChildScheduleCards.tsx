import React from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import NiceModal from "@ebay/nice-modal-react";
import { AddChildScheduleDialog } from "../features/schedules/AddChildScheduleDialog";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetChildSchedules,
  useDeleteSchedule,
  getGetChildSchedulesQueryKey,
} from "@api/endpoints/schedules/schedules";
import { ScheduleCard } from "./ScheduleCard";

type ChildScheduleCardsProps = {
  childId: string;
};

export const ChildScheduleCards: React.FC<ChildScheduleCardsProps> = ({ childId }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { data, isLoading, isFetching } = useGetChildSchedules({
    ChildId: childId,
  });
  const deleteScheduleMutation = useDeleteSchedule();

  const onAddChildScheduleClickHandler = () =>
    void NiceModal.show(AddChildScheduleDialog, { childId: childId });

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm(t("Are you sure you want to delete this schedule?"))) {
      try {
        await deleteScheduleMutation.mutateAsync({ id: scheduleId });
        enqueueSnackbar(t("Schedule deleted successfully"), { variant: "success" });
        await queryClient.invalidateQueries({
          queryKey: getGetChildSchedulesQueryKey({ ChildId: childId }),
        });
      } catch {
        enqueueSnackbar(t("Failed to delete schedule"), { variant: "error" });
      }
    }
  };

  const handleEditSchedule = (scheduleId: string) => {
    // TODO: Implement edit functionality
    console.log("Edit schedule:", scheduleId);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Loading state */}
      {isFetching && !isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Schedule Cards */}
      {data && data.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? 1.5 : 2,
          }}
        >
          {data.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={{
                id: schedule.id ?? "",
                startDate: schedule.startDate ?? "",
                endDate: schedule.endDate ?? "",
                scheduleRules: schedule.scheduleRules ?? [],
              }}
              onDelete={handleDeleteSchedule}
              onEdit={handleEditSchedule}
            />
          ))}
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            textAlign: "center",
            py: isMobile ? 4 : 6,
            px: isMobile ? 2 : 3,
            backgroundColor: "grey.50",
            border: "2px dashed",
            borderColor: "grey.300",
            borderRadius: 2,
          }}
        >
          <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom color="text.secondary">
            {t("No schedules found")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t("Create your first schedule to get started")}
          </Typography>
          <Button
            variant="contained"
            onClick={onAddChildScheduleClickHandler}
            startIcon={<AddIcon />}
            size={isMobile ? "medium" : "large"}
            fullWidth={isMobile}
            sx={{ maxWidth: isMobile ? "100%" : "auto" }}
          >
            {t("Add Schedule")}
          </Button>
        </Paper>
      )}
    </Box>
  );
};
