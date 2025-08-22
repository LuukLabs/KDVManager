import React from "react";
import { Box, Typography, IconButton, Chip, Stack, Tooltip } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import {
  useListEndMarks,
  useDeleteEndMark,
  getListEndMarksQueryKey,
} from "@api/endpoints/end-marks/end-marks";
import { getGetChildSchedulesQueryKey } from "@api/endpoints/schedules/schedules";
import type { EndMarkDto } from "@api/models/endMarkDto";
import { useQueryClient } from "@tanstack/react-query";

type EndMarksListProps = {
  childId: string;
};

export const EndMarksList: React.FC<EndMarksListProps> = ({ childId }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isFetching } = useListEndMarks({ childId }, {});
  const deleteMutation = useDeleteEndMark({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListEndMarksQueryKey({ childId }) });
        void queryClient.invalidateQueries({ queryKey: getGetChildSchedulesQueryKey({ childId }) });
      },
    },
  });

  if (!data || data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("No end marks defined")}
      </Typography>
    );
  }

  return (
    <Stack spacing={1} sx={{ opacity: isFetching ? 0.6 : 1, transition: "opacity 0.2s" }}>
      {data
        .slice()
        .sort((a, b) => dayjs(a.endDate).unix() - dayjs(b.endDate).unix())
        .map((mark: EndMarkDto) => {
          const endDate = mark.endDate ? dayjs(mark.endDate) : null;
          const deleting = deleteMutation.status === "pending"; // simplistic
          return (
            <Box
              key={mark.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {endDate ? endDate.format("YYYY-MM-DD") : t("Unknown date")}
                </Typography>
                {mark.reason && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    {mark.reason}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip size="small" label={t("End Mark") as string} color="warning" />
                <Tooltip title={t("Delete") as string}>
                  <span>
                    <IconButton
                      size="small"
                      onClick={() =>
                        mark.id &&
                        deleteMutation.mutate(
                          { id: mark.id },
                          {
                            onSuccess: () => {
                              void queryClient.invalidateQueries({
                                queryKey: getListEndMarksQueryKey({ childId }),
                              });
                              void queryClient.invalidateQueries({
                                queryKey: getGetChildSchedulesQueryKey({ childId }),
                              });
                            },
                          },
                        )
                      }
                      disabled={deleting}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          );
        })}
    </Stack>
  );
};
