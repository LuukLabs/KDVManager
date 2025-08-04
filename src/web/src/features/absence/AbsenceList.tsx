import React, { useState } from "react";
import { Box, Typography, Chip, Stack } from "@mui/material";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrAfter);
import { useTranslation } from "react-i18next";
import { useGetAbsencesByChildId } from "@api/endpoints/absences/absences";
import { DeleteAbsenceButton } from "./DeleteAbsenceButton";

type AbsenceListProps = {
  childId: string;
};

export const AbsenceList: React.FC<AbsenceListProps> = ({ childId }) => {
  const { t } = useTranslation();
  const { data: absencesRaw, isLoading } = useGetAbsencesByChildId(childId);
  const [showPast, setShowPast] = useState(false);

  if (isLoading) {
    return <Typography>{t("Loading absences...")}</Typography>;
  }

  if (!absencesRaw || (Array.isArray(absencesRaw) && absencesRaw.length === 0)) {
    return <Typography color="text.secondary">{t("No absences recorded")}</Typography>;
  }

  type Absence = {
    id: string;
    startDate: string;
    endDate: string;
    reason?: string;
  };

  const absences: Absence[] = Array.isArray(absencesRaw)
    ? absencesRaw.map((a) => ({
        ...a,
        reason: a.reason ?? undefined,
      }))
    : [];
  const today = dayjs().startOf("day");
  const futureAbsences: Absence[] = absences.filter((a: Absence) =>
    dayjs(a.startDate).isSameOrAfter(today),
  );
  const pastAbsences: Absence[] = absences.filter((a: Absence) =>
    dayjs(a.startDate).isBefore(today),
  );

  // Helper to check if absence is within next 7 days
  function isUpcoming(absence: Absence) {
    const start = dayjs(absence.startDate);
    return start.isSameOrAfter(today) && start.diff(today, "day") <= 7;
  }

  // Find next upcoming absence
  const nextAbsence =
    futureAbsences.length > 0
      ? futureAbsences.reduce(
          (min, a) => (dayjs(a.startDate).isBefore(dayjs(min.startDate)) ? a : min),
          futureAbsences[0],
        )
      : null;

  // Count total future absences
  const totalFuture = futureAbsences.length;

  function groupByYearMonth(list: Absence[]): Record<string, Absence[]> {
    return list.reduce((acc: Record<string, Absence[]>, absence: Absence) => {
      const ym = dayjs(absence.startDate).format("YYYY-MM");
      if (!acc[ym]) acc[ym] = [];
      acc[ym].push(absence);
      return acc;
    }, {});
  }

  const groupedAbsences = groupByYearMonth(showPast ? pastAbsences : futureAbsences);

  return (
    <Box sx={{ background: "#f5f7fa", p: 3, borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "#2d3a4b" }}>
        {t("Absences")}
      </Typography>
      {/* Summary Section */}
      <Box sx={{ mb: 3, display: "flex", flexDirection: "row", alignItems: "center", gap: 3 }}>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {t("Total future absences")}: {totalFuture}
          </Typography>
          {nextAbsence && (
            <Typography variant="body2" sx={{ color: "#1976d2", mt: 0.5 }}>
              {t("Next absence")}: {dayjs(nextAbsence.startDate).format("YYYY-MM-DD")}
              {nextAbsence.reason ? ` (${nextAbsence.reason})` : ""}
            </Typography>
          )}
        </Box>
        <Chip
          label={showPast ? t("Show future absences") : t("Show past absences")}
          color="primary"
          onClick={() => setShowPast((v) => !v)}
          sx={{ cursor: "pointer", fontWeight: 500, fontSize: 16, px: 2, py: 1 }}
        />
      </Box>
      {/* Absence List */}
      {Object.keys(groupedAbsences).length === 0 ? (
        <Typography color="text.secondary">
          {showPast ? t("No past absences recorded") : t("No future absences recorded")}
        </Typography>
      ) : (
        Object.entries(groupedAbsences)
          .sort(([a], [b]) => (showPast ? b.localeCompare(a) : a.localeCompare(b)))
          .map(([ym, absences]) => (
            <Box key={ym} sx={{ mb: 3, background: "#fff", borderRadius: 2, boxShadow: 0.5, p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: "#1976d2" }}>
                {dayjs(ym + "-01").format("MMMM YYYY")}
              </Typography>
              <Stack spacing={2}>
                {absences.map((absence) => (
                  <Box
                    key={absence.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      border: isUpcoming(absence) ? "2px solid #1976d2" : "1px solid #eee",
                      borderRadius: 2,
                      background: isUpcoming(absence) ? "#e3f2fd" : "#fafafa",
                      boxShadow: isUpcoming(absence) ? 1 : 0,
                      transition: "border 0.2s, background 0.2s",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: isUpcoming(absence) ? 600 : 400,
                          color: isUpcoming(absence) ? "#1976d2" : "inherit",
                        }}
                      >
                        {dayjs(absence.startDate).format("YYYY-MM-DD")} -{" "}
                        {dayjs(absence.endDate).format("YYYY-MM-DD")}
                        {absence.reason ? ` (${absence.reason})` : ""}
                      </Typography>
                    </Box>
                    <DeleteAbsenceButton id={absence.id} childId={childId} />
                  </Box>
                ))}
              </Stack>
            </Box>
          ))
      )}
    </Box>
  );
};
