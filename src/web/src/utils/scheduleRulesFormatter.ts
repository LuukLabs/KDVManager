import { type ChildScheduleListVMScheduleRule } from "@api/models/childScheduleListVMScheduleRule";
import dayjs from "dayjs";

export const scheduleRulesFormatter = (scheduleRules: ChildScheduleListVMScheduleRule[]): string => {
  
  const monday = dayjs().startOf("week").add(1, "day"); // Ensure the week starts on Monday
  
  return scheduleRules
    .map((rule) => {
      const dayName = monday.add(rule.day!, "day").format("dd"); // Get the localized day name
      return `${dayName}: ${rule.timeSlotId}`;
    })
    .join("\n"); // Join all formatted rules into a single string with line breaks
};
