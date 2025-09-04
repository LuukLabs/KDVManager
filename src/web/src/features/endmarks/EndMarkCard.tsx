import React from "react";
import { Card, CardContent, Typography, Chip, Stack, IconButton, Tooltip } from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import DeleteIcon from "@mui/icons-material/Delete";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import type { EndMarkDto } from "@api/models/endMarkDto";
import { useDeleteEndMark, getListEndMarksQueryKey } from "@api/endpoints/end-marks/end-marks";
import { getGetChildSchedulesQueryKey } from "@api/endpoints/schedules/schedules";
import { useQueryClient } from "@tanstack/react-query";

type EndMarkCardProps = {
  mark: EndMarkDto;
  childId?: string; // optional for targeted invalidation
};

export const EndMarkCard: React.FC<EndMarkCardProps> = ({ mark, childId }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const del = useDeleteEndMark({
    mutation: {
      onSuccess: () => {
        if (childId) {
          void queryClient.invalidateQueries({ queryKey: getListEndMarksQueryKey({ childId }) });
          void queryClient.invalidateQueries({
            queryKey: getGetChildSchedulesQueryKey({ childId }),
          });
        } else {
          void queryClient.invalidateQueries();
        }
      },
    },
  });
  const date = mark.endDate ? dayjs(mark.endDate) : null;
  return (
    <Card variant="outlined" sx={{ borderColor: "warning.light" }}>
      <CardContent
        sx={{ py: 1.5, "&:last-child": { pb: 1.5 }, display: "flex", alignItems: "center", gap: 2 }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip icon={<FlagIcon />} color="warning" label={t("End Mark")} size="small" />
            {mark.isSystemGenerated && (
              <Tooltip title={t("Automatically managed") as string}>
                <Chip
                  icon={<SmartToyIcon />}
                  color="info"
                  label={t("Auto")}
                  size="small"
                  variant="outlined"
                />
              </Tooltip>
            )}
          </Stack>
          <Typography variant="body2" fontWeight={600} noWrap>
            {date ? date.format("YYYY-MM-DD") : t("Unknown date")}
          </Typography>
          {mark.reason && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {mark.reason}
            </Typography>
          )}
        </Stack>
        {mark.id && (
          <Tooltip title={t("Delete") as string}>
            <span>
              <IconButton
                size="small"
                onClick={() => del.mutate({ id: mark.id! })}
                disabled={del.status === "pending"}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </CardContent>
    </Card>
  );
};
