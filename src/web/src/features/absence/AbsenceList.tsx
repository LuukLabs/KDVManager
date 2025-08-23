import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  Fade,
} from "@mui/material";
// (Header icon removed; parent provides section heading)
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrAfter);
import { useTranslation } from "react-i18next";
import { useGetAbsencesByChildId } from "@api/endpoints/absences/absences";
import { DeleteAbsenceButton } from "./DeleteAbsenceButton";

type AbsenceListProps = { childId: string };

export const AbsenceList: React.FC<AbsenceListProps> = ({ childId }) => {
  const { t } = useTranslation();
  const { data: absencesRaw, isLoading } = useGetAbsencesByChildId(childId);
  const [view, setView] = useState<"future" | "past">("future");

  const loadingSkeleton = (
    <Stack spacing={2} sx={{ mt: 1 }}>
      {[1, 2, 3].map((k) => (
        <Skeleton key={k} variant="rounded" height={56} animation="wave" />
      ))}
    </Stack>
  );

  type Absence = { id: string; startDate: string; endDate: string; reason?: string };
  const absences: Absence[] = Array.isArray(absencesRaw)
    ? absencesRaw.map((a) => ({ ...a, reason: a.reason ?? undefined }))
    : [];
  const today = dayjs().startOf("day");
  const futureAbsences = absences.filter((a) => dayjs(a.startDate).isSameOrAfter(today));
  const pastAbsences = absences.filter((a) => dayjs(a.startDate).isBefore(today));
  const totalFuture = futureAbsences.length;
  const relevantAbsences = view === "past" ? pastAbsences : futureAbsences;

  function groupByYearMonth(list: Absence[]) {
    return list.reduce(
      (acc: Record<string, Absence[]>, a) => {
        const ym = dayjs(a.startDate).format("YYYY-MM");
        (acc[ym] ||= []).push(a);
        return acc;
      },
      {} as Record<string, Absence[]>,
    );
  }
  const groupedAbsences = groupByYearMonth(relevantAbsences);

  const isUpcoming = (absence: Absence) => {
    const start = dayjs(absence.startDate);
    return start.isSameOrAfter(today) && start.diff(today, "day") <= 7;
  };
  const nextAbsence =
    futureAbsences.length > 0
      ? futureAbsences.reduce(
          (min, a) => (dayjs(a.startDate).isBefore(dayjs(min.startDate)) ? a : min),
          futureAbsences[0],
        )
      : null;

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t("Total future absences")}:{" "}
            <Box component="span" sx={{ fontWeight: 600 }}>
              {totalFuture}
            </Box>
          </Typography>
          {nextAbsence && (
            <Fade in timeout={300}>
              <Typography variant="caption" color="primary" sx={{ display: "block", mt: 0.2 }}>
                {t("Next absence")}: {dayjs(nextAbsence.startDate).format("DD MMM YYYY")}
                {nextAbsence.reason ? ` (${nextAbsence.reason})` : ""}
              </Typography>
            </Fade>
          )}
        </Box>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_, v) => v && setView(v)}
          aria-label={t("Absence view toggle")}
          sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
        >
          <ToggleButton value="future" aria-label={t("Future absences")}>
            {t("Future")}
          </ToggleButton>
          <ToggleButton value="past" aria-label={t("Past absences")}>
            {t("Past")}
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {isLoading && loadingSkeleton}
      {!isLoading && relevantAbsences.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          {view === "past" ? t("No past absences recorded") : t("No future absences recorded")}
        </Typography>
      )}
      {!isLoading && Object.keys(groupedAbsences).length > 0 && (
        <Stack spacing={2}>
          {Object.entries(groupedAbsences)
            .sort(([a], [b]) => (view === "past" ? b.localeCompare(a) : a.localeCompare(b)))
            .map(([ym, monthAbsences]) => (
              <Box key={ym}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {dayjs(ym + "-01").format("MMMM YYYY")}
                  </Typography>
                  <Chip size="small" label={monthAbsences.length} variant="outlined" />
                </Box>
                <Stack spacing={1}>
                  {monthAbsences
                    .sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf())
                    .map((absence) => {
                      const upcoming = isUpcoming(absence);
                      return (
                        <Paper
                          key={absence.id}
                          variant="outlined"
                          sx={{
                            p: 1,
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 0.75,
                            alignItems: { xs: "flex-start", sm: "center" },
                            justifyContent: "space-between",
                            borderRadius: 2,
                            borderLeft: 4,
                            borderColor: upcoming ? "primary.main" : "divider",
                            backgroundColor: "background.paper",
                            transition: "border-color .2s",
                          }}
                        >
                          <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: upcoming ? 600 : 500,
                                color: upcoming ? "primary.main" : "text.primary",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {dayjs(absence.startDate).format("DD MMM")} –{" "}
                              {dayjs(absence.endDate).format("DD MMM YYYY")}
                            </Typography>
                            {absence.reason && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ lineHeight: 1.3 }}
                              >
                                {absence.reason}
                              </Typography>
                            )}
                          </Stack>
                          <Box sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}>
                            <DeleteAbsenceButton id={absence.id} childId={childId} />
                          </Box>
                        </Paper>
                      );
                    })}
                </Stack>
              </Box>
            ))}
        </Stack>
      )}
    </Box>
  );
};
