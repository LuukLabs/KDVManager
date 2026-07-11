import type { AddScheduleCommandScheduleRule } from "@api/scheduling/models/addScheduleCommandScheduleRule";

export const isScheduleRuleComplete = (rule?: AddScheduleCommandScheduleRule | null) =>
  Boolean(rule?.timeSlotId && rule.groupId && rule.day !== undefined);

export const formatScheduleTimeRange = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) return "";

  return `${startTime.slice(0, 5)} – ${endTime.slice(0, 5)}`;
};
