import React from "react";
import { 
  Box, 
  Toolbar, 
  Button, 
  Typography, 
  CircularProgress,
  Paper,
  Container
} from "@mui/material";
import { Add as AddIcon, ViewModule as ViewModuleIcon } from "@mui/icons-material";
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
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Header */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Toolbar sx={{ gap: 2 }}>
          <ViewModuleIcon color="primary" />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t("Child Schedules")}
          </Typography>
          <Button
            variant="contained"
            onClick={onAddChildScheduleClickHandler}
            startIcon={<AddIcon />}
            sx={{ ml: 'auto' }}
          >
            {t("Add Schedule")}
          </Button>
        </Toolbar>
      </Paper>

      {/* Loading state */}
      {isFetching && !isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Schedule Cards */}
      {data && data.length > 0 ? (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: 3 
        }}>
          {data.map((schedule) => (
            <ScheduleCard 
              key={schedule.id}
              schedule={{
                id: schedule.id || '',
                startDate: schedule.startDate || '',
                endDate: schedule.endDate || '',
                scheduleRules: schedule.scheduleRules || []
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
            textAlign: 'center', 
            py: 8, 
            backgroundColor: 'background.default',
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" gutterBottom color="text.secondary">
            {t("No schedules found")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t("Create your first schedule to get started")}
          </Typography>
          <Button
            variant="contained"
            onClick={onAddChildScheduleClickHandler}
            startIcon={<AddIcon />}
          >
            {t("Add Schedule")}
          </Button>
        </Paper>
      )}
    </Container>
  );
};
