import React, { useState } from "react";
import { Box, Button, TextField, Stack } from "@mui/material";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useAddEndMark } from "@api/endpoints/end-marks/end-marks";
import { useQueryClient } from "@tanstack/react-query";
import { getListEndMarksQueryKey } from "@api/endpoints/end-marks/end-marks";
import { getGetChildSchedulesQueryKey } from "@api/endpoints/schedules/schedules";

type AddEndMarkFormProps = {
  childId: string;
  defaultDate?: string; // ISO date string (YYYY-MM-DD)
  onAdded?: () => void;
};

export const AddEndMarkForm: React.FC<AddEndMarkFormProps> = ({
  childId,
  defaultDate,
  onAdded,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const addMutation = useAddEndMark({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListEndMarksQueryKey({ childId }) });
        void queryClient.invalidateQueries({ queryKey: getGetChildSchedulesQueryKey({ childId }) });
        onAdded?.();
      },
    },
  });

  const [endDate, setEndDate] = useState<string>(defaultDate ?? dayjs().format("YYYY-MM-DD"));
  const [reason, setReason] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate({
      data: {
        childId,
        endDate,
        reason: reason.trim() || undefined,
      },
    });
  };

  const isSubmitting = addMutation.status === "pending";

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Stack spacing={2}>
        <TextField
          label={t("End Date")}
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
          required
        />
        <TextField
          label={t("Reason")}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          size="small"
          multiline
          minRows={2}
        />
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {t("Add End Mark")}
        </Button>
      </Stack>
    </Box>
  );
};
