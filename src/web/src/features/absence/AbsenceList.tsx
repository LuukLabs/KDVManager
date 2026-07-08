import React, { useState } from "react";
import { Box, Typography, Chip, Stack, Paper, Skeleton, Fade, Button, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
// (Header icon removed; parent provides section heading)
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import { useTranslation } from "react-i18next";
import { useGetAbsencesByChildId } from "@api/scheduling/endpoints/absences/absences";
import { DeleteAbsenceButton } from "./DeleteAbsenceButton";

type AbsenceListProps = { childId: string };

type Absence = { id: string; startDate: string; endDate: string; reason?: string };

const OLDER_THAN_DAYS = 30;

export const AbsenceList: React.FC<AbsenceListProps> = ({ childId }) => {
  const { t } = useTranslation();
  const { data: absencesRaw, isLoading } = useGetAbsencesByChildId(childId);
  const [showOlder, setShowOlder] = useState(false);

  const loadingSkeleton = (
    <Stack spacing={2} sx={{ mt: 1 }}>
      {[1, 2, 3].map((k) => (
        <Skeleton key={k} variant="rounded" height={56} animation="wave" />
      ))}
    </Stack>
  );

  const absences: Absence[] = Array.isArray(absencesRaw)
    ? absencesRaw.map((a) => ({ ...a, reason: a.reason ?? undefined }))
    : [];
  const today = dayjs().startOf("day");
  const olderCutoff = today.subtract(OLDER_THAN_DAYS, "day");

  // An absence stays relevant until it's fully in the past — a multi-day
  // absence that started last week but ends tomorrow still belongs here.
  const recentAbsences = absences
    .filter((a) => dayjs(a.endDate).isSameOrAfter(olderCutoff))
    .sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf());
  const olderAbsences = absences
    .filter((a) => dayjs(a.endDate).isBefore(olderCutoff))
    .sort((a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf());

  const isOngoing = (absence: Absence) =>
    dayjs(absence.startDate).isSameOrBefore(today) && dayjs(absence.endDate).isSameOrAfter(today);
  const isUpcomingSoon = (absence: Absence) => {
    const start = dayjs(absence.startDate);
    return start.isAfter(today) && start.diff(today, "day") <= 7;
  };
  const isEnded = (absence: Absence) => dayjs(absence.endDate).isBefore(today);

  // Overlapping absences can each be "ongoing" — the child is back only once
  // the latest of them ends, so pick the one with the furthest-out end date.
  const ongoingAbsences = recentAbsences.filter(isOngoing);
  const ongoingAbsence =
    ongoingAbsences.length > 0
      ? ongoingAbsences.reduce((latest, a) =>
          dayjs(a.endDate).isAfter(dayjs(latest.endDate)) ? a : latest,
        )
      : null;
  const futureAbsences = recentAbsences.filter((a) => dayjs(a.startDate).isAfter(today));
  const nextAbsence =
    futureAbsences.length > 0
      ? futureAbsences.reduce((min, a) =>
          dayjs(a.startDate).isBefore(dayjs(min.startDate)) ? a : min,
        )
      : null;

  const renderList = (list: Absence[]) => (
    <Stack spacing={1}>
      {list.map((absence) => {
        const ongoing = isOngoing(absence);
        const upcomingSoon = isUpcomingSoon(absence);
        const ended = isEnded(absence);
        const spanDays = dayjs(absence.endDate).diff(dayjs(absence.startDate), "day") + 1;
        const highlighted = ongoing || upcomingSoon;
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
              borderColor: ongoing ? "success.main" : upcomingSoon ? "primary.main" : "divider",
              backgroundColor: "background.paper",
              transition: "border-color .2s",
            }}
          >
            <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: highlighted ? 600 : 500,
                    color: ongoing
                      ? "success.dark"
                      : upcomingSoon
                        ? "primary.main"
                        : ended
                          ? "text.secondary"
                          : "text.primary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {spanDays > 1
                    ? `${dayjs(absence.startDate).format("DD MMM")} – ${dayjs(absence.endDate).format("DD MMM YYYY")}`
                    : dayjs(absence.startDate).format("DD MMM YYYY")}
                </Typography>
                {ongoing && (
                  <Chip size="small" color="success" label={t("Away now")} sx={{ flexShrink: 0 }} />
                )}
                {spanDays > 1 && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={t("{{count}} day(s)", { count: spanDays })}
                    sx={{ flexShrink: 0 }}
                  />
                )}
              </Stack>
              {absence.reason && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.3,
                  }}
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
  );

  return (
    <Box>
      {(ongoingAbsence ?? nextAbsence) && (
        <Box sx={{ mb: 2 }}>
          {ongoingAbsence ? (
            <Fade in timeout={300}>
              <Typography variant="body2" sx={{ color: "success.dark", fontWeight: 600 }}>
                {t("Away now, back {{date}}", {
                  date: dayjs(ongoingAbsence.endDate).format("DD MMM YYYY"),
                })}
              </Typography>
            </Fade>
          ) : (
            nextAbsence && (
              <Fade in timeout={300}>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                  {t("Next absence")}: {dayjs(nextAbsence.startDate).format("DD MMM YYYY")}
                  {nextAbsence.reason ? ` (${nextAbsence.reason})` : ""}
                </Typography>
              </Fade>
            )
          )}
        </Box>
      )}
      {isLoading && loadingSkeleton}
      {!isLoading && absences.length === 0 && (
        <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>
          {t("No absences recorded")}
        </Typography>
      )}
      {!isLoading && absences.length > 0 && recentAbsences.length === 0 && (
        <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>
          {t("No current or upcoming absences")}
        </Typography>
      )}
      {!isLoading && recentAbsences.length > 0 && renderList(recentAbsences)}
      {!isLoading && olderAbsences.length > 0 && (
        <>
          <Button
            size="small"
            variant="text"
            onClick={() => setShowOlder((s) => !s)}
            startIcon={showOlder ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ mt: 2 }}
          >
            {showOlder
              ? t("Hide older absences")
              : t("Show {{count}} older absence(s)", { count: olderAbsences.length })}
          </Button>
          <Collapse in={showOlder}>
            <Box sx={{ mt: 2 }}>{renderList(olderAbsences)}</Box>
          </Collapse>
        </>
      )}
    </Box>
  );
};
