import React from "react";
import { Box, Typography, Chip, Stack } from "@mui/material";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useGetAbsencesByChildId } from "@api/endpoints/absences/absences";
import { DeleteAbsenceButton } from "./DeleteAbsenceButton";

type AbsenceListProps = {
  childId: string;
};

export const AbsenceList: React.FC<AbsenceListProps> = ({ childId }) => {
  const { t } = useTranslation();
  const { data: absences, isLoading } = useGetAbsencesByChildId(childId);

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
            <DeleteAbsenceButton id={absence.id} childId={childId}/>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};
