import { type TFunction } from "i18next";
import type { ChildScheduleListVMScheduleRule } from "@api/scheduling/models/childScheduleListVMScheduleRule";
import type { DayOfWeek } from "@api/scheduling/models/dayOfWeek";
import { blocksToRules, sortDays, type ScheduleBlock } from "./scheduleBlocks";

/** A time slot the editor is allowed to offer (id and name guaranteed). */
export type SlotOption = {
  id: string;
  name: string;
  startTime?: string;
  endTime?: string;
};

/** A group the editor is allowed to offer (id and name guaranteed). */
export type GroupOption = {
  id: string;
  name: string;
};

/**
 * The one time-range format in the app: "08:30-13:00". A hyphen, not an en
 * dash, so the editor's option labels, the Weekoverzicht and the schedule
 * cards all read identically.
 */
export const formatScheduleTimeRange = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) return "";

  return `${startTime.slice(0, 5)}-${endTime.slice(0, 5)}`;
};

// Both lists are indexed by DayOfWeek, i.e. 0 = Sunday .. 6 = Saturday. They
// are rebuilt per call so a language switch is picked up; the cost is seven
// lookups in an in-memory catalog.
const shortDayLabels = (t: TFunction): string[] => [
  t("dayNames.sun"),
  t("dayNames.mon"),
  t("dayNames.tue"),
  t("dayNames.wed"),
  t("dayNames.thu"),
  t("dayNames.fri"),
  t("dayNames.sat"),
];

const longDayLabels = (t: TFunction): string[] => [
  t("dayNamesLong.sunday"),
  t("dayNamesLong.monday"),
  t("dayNamesLong.tuesday"),
  t("dayNamesLong.wednesday"),
  t("dayNamesLong.thursday"),
  t("dayNamesLong.friday"),
  t("dayNamesLong.saturday"),
];

/** Visible abbreviation for a day, e.g. "Ma". */
export const dayShortLabel = (day: DayOfWeek, t: TFunction): string =>
  shortDayLabels(t)[day] ?? String(day);

/**
 * Full day name, e.g. "Maandag". Used as the accessible name of a day
 * checkbox at every viewport, so WCAG 2.5.3 (Label in Name) holds: every
 * abbreviation above is a prefix of its long form.
 */
export const dayLongLabel = (day: DayOfWeek, t: TFunction): string =>
  longDayLabels(t)[day] ?? String(day);

const DAY_LIST_SEPARATOR = ", ";

/** Monday-first, comma-separated abbreviations: "Ma, Wo, Do". */
export const formatDayList = (days: readonly DayOfWeek[], t: TFunction): string =>
  sortDays(days)
    .map((day) => dayShortLabel(day, t))
    .join(DAY_LIST_SEPARATOR);

/** The separator every recap, subtitle and chip label uses. */
export const DOT_SEPARATOR = " · ";

/**
 * Joins the authored blocks with the time-slot and group lookups into the shape
 * `WeeklyScheduleGrid` already renders on the child's planning page, so the
 * Weekoverzicht inside the dialog is literally the widget the user lands on
 * after saving.
 *
 * Lives here rather than beside the component so the mapping can be unit-tested
 * without pulling in React, and so `ScheduleWeekOverview.tsx` stays a
 * components-only module (react-refresh). Incomplete blocks contribute nothing,
 * because `blocksToRules` drops them.
 */
export const blocksToPreviewRules = (
  blocks: readonly ScheduleBlock[],
  slots: readonly SlotOption[],
  groups: readonly GroupOption[],
): ChildScheduleListVMScheduleRule[] => {
  const slotById = new Map(slots.map((slot) => [slot.id, slot]));
  const groupById = new Map(groups.map((group) => [group.id, group]));

  return blocksToRules(blocks).map((rule) => {
    const slot = rule.timeSlotId ? slotById.get(rule.timeSlotId) : undefined;
    const group = rule.groupId ? groupById.get(rule.groupId) : undefined;
    return {
      day: rule.day,
      timeSlotId: rule.timeSlotId,
      timeSlotName: slot?.name,
      startTime: slot?.startTime,
      endTime: slot?.endTime,
      groupId: rule.groupId,
      groupName: group?.name,
    };
  });
};
