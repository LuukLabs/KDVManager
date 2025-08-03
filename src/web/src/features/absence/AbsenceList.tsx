import React from "react";
import { Box, Typography, IconButton, Chip, Stack } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useDeleteAbsence, useGetAbsencesByChildId } from "@api/endpoints/absences/absences";
import { useQueryClient } from "@tanstack/react-query";

type AbsenceListProps = {
  childId: string;
};

export const AbsenceList: React.FC<AbsenceListProps> = ({ childId }) => {
  const { t } = useTranslation();
  const { data: absences, isLoading } = useGetAbsencesByChildId(childId);
  const deleteAbsenceMutation = useDeleteAbsence();
  const queryClient = useQueryClient();

  if (isLoading) {
    return <Typography>{t("Loading absences...")}</Typography>;
  }

  if (!absences || absences.length === 0) {
    return <Typography color="text.secondary">{t("No absences recorded")}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {t("Absences")}
      </Typography>
      <Stack spacing={1}>
        {absences.map((absence) => (
          <Box
            key={absence.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1,
              border: "1px solid #eee",
              borderRadius: 1,
              background: "#fafafa",
            }}
          >
            <Box>
              <Typography variant="body2">
                {dayjs(absence.startDate).format("YYYY-MM-DD")} -{" "}
                {dayjs(absence.endDate).format("YYYY-MM-DD")}
              </Typography>
              {absence.reason && <Chip label={absence.reason} size="small" sx={{ mt: 0.5 }} />}
            </Box>
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                void (async () => {
                  if (window.confirm(t("Are you sure you want to delete this absence?"))) {
                    await deleteAbsenceMutation.mutateAsync(
                      { id: absence.id! },
                      {
                        onSuccess: () => {
                          queryClient.invalidateQueries();
                        },
                      },
                    );
                  }
                })();
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};
