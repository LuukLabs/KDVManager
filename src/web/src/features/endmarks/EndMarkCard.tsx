import React from "react";
import { Card, CardContent, Typography, Chip, Stack, Tooltip } from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import type { EndMarkDto } from "@api/scheduling/models/endMarkDto";
import { DeleteEndMarkButton } from "./DeleteEndMarkButton";

type EndMarkCardProps = {
  mark: EndMarkDto;
  childId: string;
};

export const EndMarkCard: React.FC<EndMarkCardProps> = ({ mark, childId }) => {
  const { t } = useTranslation();
  const date = mark.endDate ? dayjs(mark.endDate) : null;
  return (
    <Card variant="outlined" sx={{ borderColor: "warning.light" }}>
      <CardContent
        sx={{ py: 1.5, "&:last-child": { pb: 1.5 }, display: "flex", alignItems: "center", gap: 2 }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
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
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {date ? date.format("YYYY-MM-DD") : t("Unknown date")}
          </Typography>
          {mark.reason && (
            <Typography
              variant="caption"
              noWrap
              sx={{
                color: "text.secondary",
              }}
            >
              {mark.reason}
            </Typography>
          )}
        </Stack>
        {mark.id && <DeleteEndMarkButton id={mark.id} childId={childId} />}
      </CardContent>
    </Card>
  );
};
