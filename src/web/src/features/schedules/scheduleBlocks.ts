import type { AddScheduleCommandScheduleRule } from "@api/scheduling/models/addScheduleCommandScheduleRule";
import type { DayOfWeek } from "@api/scheduling/models/dayOfWeek";

/**
 * The pure model behind the planning editor. No React, no MUI, no DOM.
 *
 * Vocabulary — read this before changing anything:
 *
 * - A **block** (this file's `ScheduleBlock`) is ONE authored row: one time
 *   slot + one group + the set of days it applies to. The Dutch UI calls it a
 *   "Planningsregel". The code deliberately keeps the word "block" because the
 *   wire format already calls ITS items `scheduleRules`, and having two names
 *   keeps authored-row vs wire-rule unambiguous in code.
 * - A **rule** is one wire item: `{ day, timeSlotId, groupId }`. One block fans
 *   out to `days.length` rules on submit. The wire format is untouched.
 * - A **dagdeel** is one (day, time slot) booking, i.e. exactly one wire rule.
 *   User-facing recaps count dagdelen, never blocks and never "rules", because
 *   a block count and a rule count differ and would confuse the reader.
 *
 * INVARIANT (product decision): a day may appear AT MOST ONCE PER TIME SLOT,
 * regardless of group — one child is never in two groups in the same dagdeel.
 * That makes the server's duplicate-(day, slot, group) error structurally
 * unreachable. Enforcement is split:
 *   - authoring: `takenDaysBySlot` natively disables the colliding day
 *     checkboxes, and `daysRemovedBySlotChange` reports what a slot change
 *     drops;
 *   - copying: `rulesToReplacementBlocks` skips (and counts) colliding rules;
 *   - loading: NOT enforced. `rulesToBlocks` is TOTAL — pre-existing data that
 *     violates the invariant still loads, still round-trips and still saves.
 *     `daySlotConflicts` reports such data so the UI can surface it.
 */

/** Display order: Monday first, Sunday last. */
export const MONDAY_FIRST_DAYS: readonly DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

/** Monday–Friday, for the "Ma t/m vr" shortcut. */
export const WEEKDAYS: readonly DayOfWeek[] = [1, 2, 3, 4, 5];

/** One authored row. Dutch UI label: "Planningsregel {{number}}". */
export type ScheduleBlock = {
  /**
   * Stable identity for this row. All per-row state (blocked days, refs, React
   * keys) must key off this and never off an array index.
   *
   * NOTE for `useFieldArray` consumers: RHF's `keyName` defaults to `"id"` and
   * would shadow this field in the `fields` view (it does NOT touch the stored
   * form values). Mount the array as
   * `useFieldArray({ name: "blocks", keyName: "_rhfKey" })` so `field.id` stays
   * this id.
   */
  id: string;
  timeSlotId: string;
  groupId: string;
  days: DayOfWeek[];
};

/** The whole form's value shape. */
export type ScheduleFormValues = {
  startDate: string;
  blocks: ScheduleBlock[];
};

/** Minimal shape `overlapWarnings` needs from the time-slot lookup. */
export type TimeSlotLike = {
  id?: string;
  name?: string;
  startTime?: string;
  endTime?: string;
};

/** A canonical wire rule: exactly the three fields the command carries. */
export type CanonicalRule = {
  day: DayOfWeek;
  timeSlotId: string;
  groupId: string;
};

/** Any rule-ish object we may be handed (the list VM carries extra fields). */
export type RuleLike = {
  day?: DayOfWeek;
  timeSlotId?: string;
  groupId?: string;
};

// ---------------------------------------------------------------------------
// ids
// ---------------------------------------------------------------------------

let blockSeq = 0;

/** A fresh id for a block the user just added. */
export const createBlockId = (): string => `blk-${(blockSeq += 1)}`;

/**
 * Deterministic id for a block deserialised from stored rules. Deterministic on
 * purpose: `reset()` to the same rules must produce deep-equal form values, or
 * `isDirty` is meaningless.
 */
export const blockIdForKey = (timeSlotId: string, groupId: string): string =>
  `blk:${timeSlotId}:${groupId}`;

/** An empty row, optionally inheriting the previous row's group. */
export const emptyBlock = (groupId = ""): ScheduleBlock => ({
  id: createBlockId(),
  timeSlotId: "",
  groupId,
  days: [],
});

// ---------------------------------------------------------------------------
// small helpers
// ---------------------------------------------------------------------------

/** Monday-first sort index; unknown values sort last but keep their value. */
export const dayOrderIndex = (day: DayOfWeek): number => {
  const index = MONDAY_FIRST_DAYS.indexOf(day);
  return index === -1 ? MONDAY_FIRST_DAYS.length : index;
};

/** Monday-first, de-duplicated copy of a day list. */
export const sortDays = (days: readonly DayOfWeek[]): DayOfWeek[] =>
  [...new Set(days)].sort((a, b) => dayOrderIndex(a) - dayOrderIndex(b) || Number(a) - Number(b));

/** A block only contributes rules once it has a slot, a group and a day. */
export const isBlockComplete = (block: ScheduleBlock): boolean =>
  Boolean(block.timeSlotId) && Boolean(block.groupId) && block.days.length > 0;

/** The identity used for every rule-set comparison (diff, round trip, dedupe). */
export const ruleKey = (rule: RuleLike): string =>
  `${String(rule.day)}|${rule.timeSlotId ?? ""}|${rule.groupId ?? ""}`;

/** The identity that the day-per-time-slot invariant is defined on. */
export const daySlotKey = (day: DayOfWeek, timeSlotId: string): string =>
  `${String(day)}|${timeSlotId}`;

const asString = (value: string | undefined | null): string => value ?? "";

// ---------------------------------------------------------------------------
// blocks <-> rules
// ---------------------------------------------------------------------------

/**
 * Fan a block list out to wire rules: for every block in array order, one rule
 * per day in Monday-first order. Incomplete blocks contribute nothing (the
 * submit gate keeps them from existing at submit time, but the preview, the
 * recap and the diff all run while the user is still typing).
 *
 * `day` is always the number that was stored; the strings "undefined"/"null"
 * can never appear.
 */
export const blocksToRules = (
  blocks: readonly ScheduleBlock[],
): AddScheduleCommandScheduleRule[] => {
  const rules: AddScheduleCommandScheduleRule[] = [];
  for (const block of blocks) {
    if (!isBlockComplete(block)) continue;
    for (const day of sortDays(block.days)) {
      rules.push({ day, timeSlotId: block.timeSlotId, groupId: block.groupId });
    }
  }
  return rules;
};

/**
 * Deserialise stored rules into authored blocks, grouped by
 * (timeSlotId, groupId).
 *
 * TOTAL: never throws and never drops a rule. Rules whose time slot or group
 * no longer exists still land in a block (the UI shows "Onbekend tijdslot" /
 * "Onbekende groep"), and rules that violate the day-per-time-slot invariant
 * are kept as-is, so an innocent start-date edit can never silently delete
 * data. A `day` that is not one of 0..6 is preserved verbatim.
 *
 * Deterministic order: first day's Monday-first index, then timeSlotId, then
 * groupId.
 */
export const rulesToBlocks = (rules: readonly RuleLike[] | null | undefined): ScheduleBlock[] => {
  const byKey = new Map<string, { timeSlotId: string; groupId: string; days: DayOfWeek[] }>();

  for (const rule of rules ?? []) {
    const timeSlotId = asString(rule.timeSlotId);
    const groupId = asString(rule.groupId);
    // NUL separator so the grouping key can never be ambiguous.
    const key = `${timeSlotId}\u0000${groupId}`;
    const existing = byKey.get(key);
    // `rule.day` is typed optional by the generated client; keep whatever came
    // in rather than inventing a day, so the round trip stays lossless.
    const day = rule.day!;
    if (existing) {
      existing.days.push(day);
    } else {
      byKey.set(key, { timeSlotId, groupId, days: [day] });
    }
  }

  return [...byKey.values()]
    .map((group) => ({
      id: blockIdForKey(group.timeSlotId, group.groupId),
      timeSlotId: group.timeSlotId,
      groupId: group.groupId,
      days: sortDays(group.days),
    }))
    .sort(
      (a, b) =>
        dayOrderIndex(a.days[0]) - dayOrderIndex(b.days[0]) ||
        a.timeSlotId.localeCompare(b.timeSlotId) ||
        a.groupId.localeCompare(b.groupId),
    );
};

/**
 * Project any rule-ish list onto `{ day, timeSlotId, groupId }` and sort it
 * stably. Two things depend on this:
 *   - `isDirty` is only meaningful if the same planning always serialises to
 *     the same array (the list VM carries `timeSlotName`/`startTime`/... which
 *     must not leak into form values or into a diff);
 *   - `diffRules` compares canonical shapes.
 *
 * Idempotent. Does NOT de-duplicate: nothing may be dropped here.
 */
export const canonicaliseRules = (rules: readonly RuleLike[] | null | undefined): CanonicalRule[] =>
  (rules ?? [])
    .map((rule) => ({
      // Preserved verbatim: nothing is invented and nothing is dropped.
      day: rule.day!,
      timeSlotId: asString(rule.timeSlotId),
      groupId: asString(rule.groupId),
    }))
    .sort(
      (a, b) =>
        dayOrderIndex(a.day) - dayOrderIndex(b.day) ||
        Number(a.day) - Number(b.day) ||
        a.timeSlotId.localeCompare(b.timeSlotId) ||
        a.groupId.localeCompare(b.groupId),
    );

// ---------------------------------------------------------------------------
// the day-per-time-slot invariant
// ---------------------------------------------------------------------------

/**
 * Which days are already claimed per time slot, ignoring one block.
 *
 * The UI passes the id of the block being rendered, so a block never blocks its
 * own days. Only the SAME time slot blocks; a different time slot never does.
 */
export const takenDaysBySlot = (
  blocks: readonly ScheduleBlock[],
  exceptBlockId?: string,
): Map<string, Set<DayOfWeek>> => {
  const taken = new Map<string, Set<DayOfWeek>>();
  for (const block of blocks) {
    if (block.id === exceptBlockId) continue;
    if (!block.timeSlotId) continue;
    let set = taken.get(block.timeSlotId);
    if (!set) {
      set = new Set<DayOfWeek>();
      taken.set(block.timeSlotId, set);
    }
    for (const day of block.days) set.add(day);
  }
  return taken;
};

/**
 * The days that would have to leave `blockId` if its time slot became
 * `newSlotId`, because another block already claims them in that slot.
 * Monday-first. Mutates nothing; no other block is ever affected.
 */
export const daysRemovedBySlotChange = (
  blocks: readonly ScheduleBlock[],
  blockId: string,
  newSlotId: string,
): DayOfWeek[] => {
  const block = blocks.find((candidate) => candidate.id === blockId);
  if (!block || !newSlotId) return [];
  const taken = takenDaysBySlot(blocks, blockId).get(newSlotId);
  if (!taken) return [];
  return sortDays(block.days.filter((day) => taken.has(day)));
};

/**
 * Reports violations of the day-per-time-slot invariant in a block list — i.e.
 * the same day claimed twice in one time slot (necessarily by two different
 * groups, since a block de-duplicates its own days).
 *
 * Empty for anything the editor authored. Non-empty only for data that already
 * existed in the database, which is loaded and saved unchanged; the UI can use
 * this to explain why such a planning looks unusual.
 */
export const daySlotConflicts = (
  blocks: readonly ScheduleBlock[],
): { day: DayOfWeek; timeSlotId: string; blockIds: string[] }[] => {
  const seen = new Map<string, { day: DayOfWeek; timeSlotId: string; blockIds: string[] }>();
  for (const block of blocks) {
    if (!block.timeSlotId) continue;
    for (const day of sortDays(block.days)) {
      const key = daySlotKey(day, block.timeSlotId);
      const entry = seen.get(key);
      if (entry) entry.blockIds.push(block.id);
      else seen.set(key, { day, timeSlotId: block.timeSlotId, blockIds: [block.id] });
    }
  }
  return [...seen.values()].filter((entry) => entry.blockIds.length > 1);
};

// ---------------------------------------------------------------------------
// copy current planning (REPLACES the draft — see product decision 3)
// ---------------------------------------------------------------------------

/**
 * Turn an existing planning's rules into the block list that REPLACES the
 * current draft.
 *
 * Unlike `rulesToBlocks` this is an authoring path, so it is not total: rules
 * whose time slot or group no longer exists are dropped, and so are rules that
 * would violate the day-per-time-slot invariant (first one wins, Monday-first).
 * `skipped` counts the dropped dagdelen so the UI can say so out loud.
 *
 * Never touches `startDate`.
 */
export const rulesToReplacementBlocks = (
  rules: readonly RuleLike[] | null | undefined,
  knownSlotIds: Iterable<string>,
  knownGroupIds: Iterable<string>,
): { blocks: ScheduleBlock[]; skipped: number } => {
  const slots = new Set(knownSlotIds);
  const groups = new Set(knownGroupIds);

  const usable: CanonicalRule[] = [];
  let skipped = 0;
  const claimed = new Set<string>();

  for (const rule of canonicaliseRules(rules)) {
    if (!slots.has(rule.timeSlotId) || !groups.has(rule.groupId)) {
      skipped += 1;
      continue;
    }
    const key = daySlotKey(rule.day, rule.timeSlotId);
    if (claimed.has(key)) {
      skipped += 1;
      continue;
    }
    claimed.add(key);
    usable.push(rule);
  }

  return { blocks: rulesToBlocks(usable), skipped };
};

// ---------------------------------------------------------------------------
// overlap (legal but suspicious — never blocking)
// ---------------------------------------------------------------------------

const toMinutes = (time: string | undefined): number | null => {
  if (!time) return null;
  const [hours, minutes] = time.split(":");
  const h = Number(hours);
  const m = Number(minutes);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
};

export type OverlapWarning = {
  day: DayOfWeek;
  /** Display name of the earlier-starting slot (falls back to its id). */
  slotA: string;
  /** Display name of the later-starting slot (falls back to its id). */
  slotB: string;
  slotAId: string;
  slotBId: string;
};

/**
 * Two DIFFERENT time slots whose clock ranges overlap on a day the child is
 * booked for both. Legal server-side (a tenant may model "Hele dag" alongside
 * "Ochtend"), so this is advisory only and must never block submit.
 *
 * One warning per (day, slot pair); `slotA` is the earlier-starting slot.
 * Deterministic order: day (Monday-first), then slot names.
 */
export const overlapWarnings = (
  blocks: readonly ScheduleBlock[],
  timeSlots: readonly TimeSlotLike[],
): OverlapWarning[] => {
  const slotById = new Map<string, TimeSlotLike>();
  for (const slot of timeSlots) if (slot.id) slotById.set(slot.id, slot);

  // day -> the set of slot ids booked on that day
  const slotsByDay = new Map<DayOfWeek, Set<string>>();
  for (const block of blocks) {
    if (!isBlockComplete(block)) continue;
    for (const day of block.days) {
      let set = slotsByDay.get(day);
      if (!set) {
        set = new Set<string>();
        slotsByDay.set(day, set);
      }
      set.add(block.timeSlotId);
    }
  }

  const warnings: OverlapWarning[] = [];
  for (const day of [...slotsByDay.keys()].sort((a, b) => dayOrderIndex(a) - dayOrderIndex(b))) {
    const ids = [...slotsByDay.get(day)!];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const first = slotById.get(ids[i]);
        const second = slotById.get(ids[j]);
        if (!first || !second) continue;

        const aStart = toMinutes(first.startTime);
        const aEnd = toMinutes(first.endTime);
        const bStart = toMinutes(second.startTime);
        const bEnd = toMinutes(second.endTime);
        if (aStart === null || aEnd === null || bStart === null || bEnd === null) continue;
        if (aStart >= bEnd || bStart >= aEnd) continue;

        const [early, late] =
          aStart <= bStart
            ? [
                { id: ids[i], slot: first },
                { id: ids[j], slot: second },
              ]
            : [
                { id: ids[j], slot: second },
                { id: ids[i], slot: first },
              ];
        warnings.push({
          day,
          slotA: early.slot.name ?? early.id,
          slotB: late.slot.name ?? late.id,
          slotAId: early.id,
          slotBId: late.id,
        });
      }
    }
  }
  return warnings.sort(
    (a, b) =>
      dayOrderIndex(a.day) - dayOrderIndex(b.day) ||
      a.slotA.localeCompare(b.slotA) ||
      a.slotB.localeCompare(b.slotB),
  );
};

// ---------------------------------------------------------------------------
// edit-mode diff and recap
// ---------------------------------------------------------------------------

/**
 * What the PUT will add and remove, keyed on (day, timeSlotId, groupId).
 * A group change on one day is therefore one `added` plus one `removed`.
 * Both lists come back canonicalised.
 */
export const diffRules = (
  before: readonly RuleLike[] | null | undefined,
  after: readonly RuleLike[] | null | undefined,
): { added: CanonicalRule[]; removed: CanonicalRule[] } => {
  const beforeRules = canonicaliseRules(before);
  const afterRules = canonicaliseRules(after);
  const beforeKeys = new Set(beforeRules.map(ruleKey));
  const afterKeys = new Set(afterRules.map(ruleKey));
  return {
    added: afterRules.filter((rule) => !beforeKeys.has(ruleKey(rule))),
    removed: beforeRules.filter((rule) => !afterKeys.has(ruleKey(rule))),
  };
};

/**
 * How many dagdelen (day + time slot bookings) this draft represents — the ONLY
 * count that may be shown to the user. Do not surface a block count or a wire
 * "rule" count: one planningsregel fans out to several wire rules and the
 * mismatch reads as a bug.
 *
 * Incomplete blocks count for nothing, because they save nothing.
 */
export const countDagdelen = (blocks: readonly ScheduleBlock[]): number => {
  let total = 0;
  for (const block of blocks) {
    if (!isBlockComplete(block)) continue;
    total += new Set(block.days).size;
  }
  return total;
};
