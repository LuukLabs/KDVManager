import type { QueryFilters } from "@tanstack/react-query";
import { getGetDailyOverviewQueryKey } from "@api/scheduling/endpoints/overview/overview";
import { getGetGroupSummaryQueryKey } from "@api/scheduling/endpoints/schedules/schedules";

/**
 * Every cache entry whose contents depend on who is present on the board.
 *
 * Use this from anything that changes a child's day — the absence mutations
 * today, a presence mutation later — instead of a bare `invalidateQueries()`,
 * which drops children, guardians and settings along with it.
 *
 * Deliberately not date-scoped. Orval keys are `[url, paramsObject]` tuples
 * whose params object is a single opaque element, so selecting one date means a
 * predicate per endpoint — and absences are authored as a date *range*, so a
 * single write can touch any number of days. A date-scoped variant belongs with
 * the first mutation that actually knows it changed exactly one day.
 */
export const allDayBoardFilters = (): QueryFilters[] => [
  { queryKey: [getGetDailyOverviewQueryKey()[0]] },
  { queryKey: [getGetGroupSummaryQueryKey()[0]] },
];
