import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useGetChildSchedules } from "@api/endpoints/schedules/schedules";
import { useListEndMarks } from "@api/endpoints/end-marks/end-marks";
import { ScheduleCard } from "../../components/ScheduleCard";
import { EndMarkCard } from "../endmarks/EndMarkCard";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

type ChildScheduleTimelineProps = {
  childId: string;
};

type TimelineItemSchedule = {
  type: "schedule";
  start: string; // start date
  sort: number;
  schedule: {
    id: string;
    startDate: string;
    endDate: string | null;
    scheduleRules: any[];
  };
};
type TimelineItemEndMark = {
  type: "endmark";
  start: string; // end mark date for positioning
  sort: number;
  mark: any;
};

type TimelineItem = TimelineItemSchedule | TimelineItemEndMark;

export const ChildScheduleTimeline: React.FC<ChildScheduleTimelineProps> = ({ childId }) => {
  const { t } = useTranslation();
  const { data: schedules } = useGetChildSchedules({ childId });
  const { data: endMarks } = useListEndMarks({ childId }, {});

  const items: TimelineItem[] = [];
  schedules?.forEach((s) => {
    if (!s.id || !s.startDate) return;
    items.push({
      type: "schedule",
      start: s.startDate,
      sort: dayjs(s.startDate).unix(),
      schedule: {
        id: s.id,
        startDate: s.startDate,
        endDate: s.endDate ?? null,
        scheduleRules: s.scheduleRules ?? [],
      },
    });
  });
  endMarks?.forEach((m) => {
    if (!m.id || !m.endDate) return;
    items.push({
      type: "endmark",
      start: m.endDate,
      sort: dayjs(m.endDate).unix(),
      mark: m,
    });
  });

  items.sort((a, b) => {
    const aDate = dayjs(a.start);
    const bDate = dayjs(b.start);

    // Primary sort: by day (descending — newest first)
    if (!aDate.isSame(bDate, "day")) {
      if (aDate.isBefore(bDate, "day")) return 1; // a earlier => a after b
      if (aDate.isAfter(bDate, "day")) return -1; // a later => a before b
    }

    // If same day, ensure schedules come before end marks
    if (a.type !== b.type) {
      return a.type === "schedule" ? -1 : 1;
    }

    // Fallback: preserve descending timestamp order
    return b.sort - a.sort;
  });

  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("No schedules found")}
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {items.map((item) => (
        <Box key={(item.type === "schedule" ? item.schedule.id : item.mark.id) + item.type}>
          {item.type === "schedule" ? (
            <ScheduleCard schedule={item.schedule} />
          ) : (
            <EndMarkCard mark={item.mark} childId={childId} />
          )}
        </Box>
      ))}
    </Stack>
  );
};
