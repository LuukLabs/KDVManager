import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import { executeFetch } from "../../mutator/executeFetch";

export type DailyOverviewVM = {
  date: string; // ISO date string (yyyy-MM-dd)
  isClosed: boolean;
  closureReason?: string | null;
  groups: GroupDailyOverviewVM[];
};
export type GroupDailyOverviewVM = {
  groupId: string;
  groupName: string;
  schedules: ChildScheduleDailyVM[];
};
export type ChildScheduleDailyVM = {
  scheduleId: string;
  childId: string;
  timeSlotName: string;
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  dateOfBirth?: string | null;
  age?: number | null;
  isAbsent: boolean;
  absenceReason?: string | null;
};

export const getDailyOverview = (date: string, signal?: AbortSignal) => {
  return executeFetch<DailyOverviewVM>({
    url: `/scheduling/v1/overview/daily`,
    method: "GET",
    params: { date },
    signal,
  });
};

export const useDailyOverview = (
  date: string | undefined,
  options?: Partial<UseQueryOptions<DailyOverviewVM>>,
) => {
  return useQuery<DailyOverviewVM>({
    queryKey: ["daily-overview", date],
    queryFn: ({ signal }) => {
      if (!date) throw new Error("Date is required");
      return getDailyOverview(date, signal);
    },
    enabled: !!date,
    staleTime: 60_000,
    ...options,
  }) as UseQueryResult<DailyOverviewVM> & { data: DailyOverviewVM | undefined };
};
