import { type ChildScheduleListVMScheduleRule } from "@api/models/childScheduleListVMScheduleRule";
import dayjs from "dayjs";

export const scheduleRulesFormatter = (
  scheduleRules: ChildScheduleListVMScheduleRule[],
): string => {
  const monday = dayjs().startOf("week").add(1, "day");

  return scheduleRules
    .map((rule) => {
      const dayName = monday.add(rule.day!, "day").format("dd");
      return `${dayName}: ${rule.timeSlotName} (${rule.startTime?.slice(0, 5)}-${rule.endTime?.slice(0, 5)})`;
    })
    .join("\n");
};
