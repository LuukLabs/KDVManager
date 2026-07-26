import { useMemo } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useGetDailyOverview } from "@api/scheduling/endpoints/overview/overview";
import type { ChildScheduleDailyVM } from "@api/scheduling/models/childScheduleDailyVM";
import {
  type DagdeelRow,
  type DagdeelStatus,
  type GroupBoard,
  STATUS_ORDER,
  emptyStatusCounts,
} from "./types";

export type DayBoard = {
  isLoading: boolean;
  isError: boolean;
  isClosed: boolean;
  closureReason?: string | null;
  /** True only when the selected date is today. Gates polling. */
  isToday: boolean;
  groups: GroupBoard[];
};

/**
 * Derives a dagdeel's status from what the API can currently tell us.
 *
 * `arrived`, `departed` and `noShow` are unreachable until an attendance
 * registration exists — that is deliberate. They are typed and rendered, so
 * landing attendance means filling this function in, not reshaping the board.
 */
const deriveStatus = (schedule: ChildScheduleDailyVM, isClosed: boolean): DagdeelStatus => {
  if (isClosed) return "closed";
  if (schedule.isAbsent) return "reportedAbsent";
  return "expected";
};

const toRow = (schedule: ChildScheduleDailyVM, isClosed: boolean): DagdeelRow => {
  const childId = schedule.childId ?? "";
  const groupId = schedule.groupId ?? "";
  const timeSlotId = schedule.timeSlotId ?? "";
  return {
    key: `${childId}:${groupId}:${timeSlotId}`,
    scheduleId: schedule.scheduleId ?? null,
    childId,
    childFullName: schedule.childFullName ?? "",
    groupId,
    timeSlotId,
    timeSlotName: schedule.timeSlotName ?? "",
    plannedStart: schedule.startTime ?? "",
    plannedEnd: schedule.endTime ?? "",
    age: schedule.age,
    status: deriveStatus(schedule, isClosed),
    absenceReason: schedule.absenceReason,
    actualStart: null,
    actualEnd: null,
  };
};

/**
 * The board's single source of truth for who is where on one date.
 *
 * One query. The daily overview already lists every group — including groups
 * with nobody in them — so the group list, the roster, the closure and each
 * child's state all arrive together and cannot paint out of step. It also means
 * the board is no longer capped by the paginated group list, which used to
 * disagree with this payload past 25 groups.
 */
export const useDayBoard = (date: Dayjs): DayBoard => {
  const dateParam = date.format("YYYY-MM-DD");
  const isToday = date.isSame(dayjs(), "day");

  const { data, isLoading, isError } = useGetDailyOverview(
    { date: dateParam },
    {
      query: {
        staleTime: 30_000,
        // A board left open on a wall tablet should keep up with the day it
        // claims to show; a board on a past date has nothing to keep up with.
        refetchInterval: isToday ? 60_000 : false,
      },
    },
  );

  const isClosed = !!data?.isClosed;

  const groups = useMemo<GroupBoard[]>(() => {
    return (data?.groups ?? []).map((group) => {
      const rows = (group.schedules ?? [])
        .map((schedule) => toRow(schedule, isClosed))
        .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

      // Count children, not dagdelen: a child planned for ochtend and middag is
      // one child. The summary's "14 kinderen" counts the same way.
      const seenByStatus = new Map<DagdeelStatus, Set<string>>();
      for (const row of rows) {
        const seen = seenByStatus.get(row.status) ?? new Set<string>();
        seen.add(row.childId);
        seenByStatus.set(row.status, seen);
      }
      const countsByStatus = emptyStatusCounts();
      for (const [status, seen] of seenByStatus) countsByStatus[status] = seen.size;

      return {
        groupId: group.groupId ?? "",
        groupName: group.groupName ?? "",
        rows,
        countsByStatus,
      };
    });
  }, [data?.groups, isClosed]);

  return {
    isLoading,
    isError,
    isClosed,
    closureReason: data?.closureReason,
    isToday,
    groups,
  };
};
