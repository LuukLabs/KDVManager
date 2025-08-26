import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { keepPreviousData } from "@tanstack/react-query";

import { useListTimeSlots } from "@api/endpoints/time-slots/time-slots";
import { TimeSlotCard } from "./TimeSlotCard";

const TimeSlotsGrid: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { data, isLoading, isFetching } = useListTimeSlots(undefined, {
    query: { placeholderData: keepPreviousData },
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            {t("Loading time slots...")}
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!data?.value || data.value.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: "center",
          backgroundColor: "grey.50",
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t("No time slots found")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("Create your first time slot to get started.")}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: isMobile ? 2 : 3,
        }}
      >
        {data.value.map((timeSlot) => (
          <TimeSlotCard key={timeSlot.id} timeSlot={timeSlot} />
        ))}
      </Box>

      {isFetching && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 3,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

export default TimeSlotsGrid;
