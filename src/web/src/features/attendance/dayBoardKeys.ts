import type { QueryFilters } from "@tanstack/react-query";
import { getGetDailyOverviewQueryKey } from "@api/scheduling/endpoints/overview/overview";
import { getGetGroupSummaryQueryKey } from "@api/scheduling/endpoints/schedules/schedules";

/**
 * Every cache entry whose contents depend on who is present on `date`.
 *
 * Orval keys are `[url, paramsObject]` tuples where the params object is a
 * single opaque element, so no prefix match can select "everything for date X".
 * The daily overview is keyed on `{ date }` alone and matches exactly; the group
 * summary is keyed on `{ groupId, date }` and needs a predicate to catch every
 * group without nuking other dates.
 *
 * Use this from anything that changes a child's day — the absence mutations
 * today, a presence mutation later — instead of a bare `invalidateQueries()`.
 *
 * @param date `YYYY-MM-DD`
 */
export const dayBoardFilters = (date: string): QueryFilters[] => [
  { queryKey: getGetDailyOverviewQueryKey({ date }) },
  {
    predicate: (query) =>
      query.queryKey[0] === getGetGroupSummaryQueryKey()[0] &&
      (query.queryKey[1] as { date?: string } | undefined)?.date === date,
  },
];

/**
 * Absences are authored as a date *range* from the child dossier, so a single
 * write can touch any number of days. Until a range-aware filter exists, fall
 * back to invalidating the whole board rather than guessing which days moved.
 */
export const allDayBoardFilters = (): QueryFilters[] => [
  { queryKey: [getGetDailyOverviewQueryKey()[0]] },
  { queryKey: [getGetGroupSummaryQueryKey()[0]] },
];
