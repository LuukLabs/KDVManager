/**
 * Generated by orval v7.5.0 🍺
 * Do not edit manually.
 * KDVManager CRM API
 * OpenAPI spec version: v1
 */
import type { ChildScheduleListVMScheduleRule } from "./childScheduleListVMScheduleRule";

export type ChildScheduleListVM = {
  id?: string;
  childId?: string;
  startDate?: string;
  /** @nullable */
  endDate?: string | null;
  groupId?: string;
  /** @nullable */
  groupName?: string | null;
  /** @nullable */
  scheduleRules?: ChildScheduleListVMScheduleRule[] | null;
};
