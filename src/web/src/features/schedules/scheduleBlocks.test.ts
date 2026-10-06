import { describe, expect, it } from "vitest";

import type { DayOfWeek } from "@api/scheduling/models/dayOfWeek";
import {
  blockIdForKey,
  blocksToRules,
  canonicaliseRules,
  countDagdelen,
  createBlockId,
  daySlotConflicts,
  daysRemovedBySlotChange,
  diffRules,
  emptyBlock,
  isBlockComplete,
  MONDAY_FIRST_DAYS,
  overlapWarnings,
  ruleKey,
  rulesToBlocks,
  rulesToReplacementBlocks,
  sortDays,
  takenDaysBySlot,
  WEEKDAYS,
  type RuleLike,
  type ScheduleBlock,
  type TimeSlotLike,
} from "./scheduleBlocks";

// DOM-free by design: this file is the regression net for the wire format, so
// it must keep passing even if every component around it is rewritten.

const SLOT_DAY = "slot-hele-dag";
const SLOT_MORNING = "slot-ochtend";
const SLOT_AFTERNOON = "slot-middag";
const GROUP_A = "group-sterretjes";
const GROUP_B = "group-zonnetjes";

const block = (partial: Partial<ScheduleBlock> & { id: string }): ScheduleBlock => ({
  timeSlotId: SLOT_DAY,
  groupId: GROUP_A,
  days: [],
  ...partial,
});

const keys = (rules: readonly RuleLike[]) => rules.map(ruleKey).sort();

const timeSlots: TimeSlotLike[] = [
  { id: SLOT_DAY, name: "Hele dag", startTime: "08:00:00", endTime: "18:00:00" },
  { id: SLOT_MORNING, name: "Ochtend", startTime: "08:00:00", endTime: "13:00:00" },
  { id: SLOT_AFTERNOON, name: "Middag", startTime: "13:00:00", endTime: "18:00:00" },
];

describe("day ordering", () => {
  it("orders Monday first and Sunday last", () => {
    expect(MONDAY_FIRST_DAYS).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(WEEKDAYS).toEqual([1, 2, 3, 4, 5]);
  });

  it("sorts and de-duplicates days Monday-first", () => {
    expect(sortDays([0, 5, 1, 6, 1, 3])).toEqual([1, 3, 5, 6, 0]);
  });
});

describe("blocksToRules", () => {
  it("emits one rule per (block, day) in array order and Monday-first day order", () => {
    const rules = blocksToRules([
      block({ id: "b1", timeSlotId: SLOT_DAY, groupId: GROUP_A, days: [4, 1, 2] }),
      block({ id: "b2", timeSlotId: SLOT_MORNING, groupId: GROUP_B, days: [5] }),
    ]);

    expect(rules).toEqual([
      { day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_A },
      { day: 2, timeSlotId: SLOT_DAY, groupId: GROUP_A },
      { day: 4, timeSlotId: SLOT_DAY, groupId: GROUP_A },
      { day: 5, timeSlotId: SLOT_MORNING, groupId: GROUP_B },
    ]);
  });

  it("never emits a non-numeric day", () => {
    const rules = blocksToRules([block({ id: "b1", days: [0, 1, 2, 3, 4, 5, 6] })]);
    expect(rules).toHaveLength(7);
    for (const rule of rules) expect(typeof rule.day).toBe("number");
  });

  it("treats Sunday (0) as a first-class day", () => {
    const rules = blocksToRules([block({ id: "b1", days: [0] })]);
    expect(rules).toEqual([{ day: 0, timeSlotId: SLOT_DAY, groupId: GROUP_A }]);
  });

  it("skips incomplete blocks", () => {
    expect(
      blocksToRules([
        block({ id: "b1", timeSlotId: "", days: [1] }),
        block({ id: "b2", groupId: "", days: [1] }),
        block({ id: "b3", days: [] }),
      ]),
    ).toEqual([]);
  });

  it("de-duplicates repeated days inside one block", () => {
    expect(blocksToRules([block({ id: "b1", days: [1, 1, 1] })])).toHaveLength(1);
  });

  it("emits no duplicate rule key for any block set that honours the invariant", () => {
    // Property test: random block sets built so that a (day, timeSlotId) pair is
    // claimed at most once — exactly what the UI's day blocking guarantees.
    let seed = 1337;
    const random = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    const slots = [SLOT_DAY, SLOT_MORNING, SLOT_AFTERNOON];
    const groups = [GROUP_A, GROUP_B, "group-kikkers"];

    for (let run = 0; run < 200; run++) {
      const claimed = new Set<string>();
      const blocks: ScheduleBlock[] = [];
      const blockCount = 1 + Math.floor(random() * 4);
      for (let b = 0; b < blockCount; b++) {
        const timeSlotId = slots[Math.floor(random() * slots.length)];
        const groupId = groups[Math.floor(random() * groups.length)];
        const days: DayOfWeek[] = [];
        for (const day of MONDAY_FIRST_DAYS) {
          if (random() < 0.4 && !claimed.has(`${String(day)}|${timeSlotId}`)) {
            claimed.add(`${String(day)}|${timeSlotId}`);
            days.push(day);
          }
        }
        blocks.push({ id: `b${String(b)}`, timeSlotId, groupId, days });
      }

      const rules = blocksToRules(blocks);
      const ruleKeys = rules.map(ruleKey);
      expect(new Set(ruleKeys).size).toBe(ruleKeys.length);
      expect(daySlotConflicts(blocks)).toEqual([]);
    }
  });
});

describe("rulesToBlocks", () => {
  it("groups by (timeSlotId, groupId)", () => {
    const blocks = rulesToBlocks([
      { day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_A },
      { day: 4, timeSlotId: SLOT_DAY, groupId: GROUP_A },
      { day: 5, timeSlotId: SLOT_DAY, groupId: GROUP_B },
      { day: 2, timeSlotId: SLOT_MORNING, groupId: GROUP_A },
    ]);

    expect(blocks).toEqual([
      {
        id: blockIdForKey(SLOT_DAY, GROUP_A),
        timeSlotId: SLOT_DAY,
        groupId: GROUP_A,
        days: [1, 4],
      },
      {
        id: blockIdForKey(SLOT_MORNING, GROUP_A),
        timeSlotId: SLOT_MORNING,
        groupId: GROUP_A,
        days: [2],
      },
      { id: blockIdForKey(SLOT_DAY, GROUP_B), timeSlotId: SLOT_DAY, groupId: GROUP_B, days: [5] },
    ]);
  });

  it("is deterministic and gives deep-equal output for the same input (isDirty depends on it)", () => {
    const rules: RuleLike[] = [
      { day: 3, timeSlotId: SLOT_MORNING, groupId: GROUP_B },
      { day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_A },
    ];
    expect(rulesToBlocks(rules)).toEqual(rulesToBlocks([...rules].reverse()));
  });

  it("returns an empty list for empty, null and undefined input", () => {
    expect(rulesToBlocks([])).toEqual([]);
    expect(rulesToBlocks(null)).toEqual([]);
    expect(rulesToBlocks(undefined)).toEqual([]);
  });

  it("keeps a day set that spans Saturday and Sunday, ordered Monday-first", () => {
    const blocks = rulesToBlocks([
      { day: 0, timeSlotId: SLOT_DAY, groupId: GROUP_A },
      { day: 6, timeSlotId: SLOT_DAY, groupId: GROUP_A },
      { day: 5, timeSlotId: SLOT_DAY, groupId: GROUP_A },
    ]);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].days).toEqual([5, 6, 0]);
  });

  it("is TOTAL: keeps rules whose time slot or group is unknown to the lookups", () => {
    const rules: RuleLike[] = [
      { day: 1, timeSlotId: "deleted-slot", groupId: "deleted-group" },
      { day: 2, timeSlotId: SLOT_DAY, groupId: GROUP_A },
    ];
    const blocks = rulesToBlocks(rules);
    expect(countDagdelen(blocks)).toBe(2);
    expect(keys(blocksToRules(blocks))).toEqual(keys(rules));
  });

  it("is TOTAL: data that VIOLATES the day-per-time-slot invariant loads without loss", () => {
    // Same day + same time slot, two different groups. The editor can never
    // author this, but the database may already contain it.
    const rules: RuleLike[] = [
      { day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_A },
      { day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_B },
    ];
    const blocks = rulesToBlocks(rules);

    expect(blocks).toHaveLength(2);
    expect(countDagdelen(blocks)).toBe(2);
    expect(keys(blocksToRules(blocks))).toEqual(keys(rules));

    // ...and it is reported, so the UI can explain the oddity.
    expect(daySlotConflicts(blocks)).toEqual([
      {
        day: 1,
        timeSlotId: SLOT_DAY,
        blockIds: [blockIdForKey(SLOT_DAY, GROUP_A), blockIdForKey(SLOT_DAY, GROUP_B)],
      },
    ]);
  });

  it("ignores the extra fields the list VM carries", () => {
    const blocks = rulesToBlocks([
      {
        day: 1,
        timeSlotId: SLOT_DAY,
        groupId: GROUP_A,
        timeSlotName: "Hele dag",
        startTime: "08:00:00",
        endTime: "18:00:00",
        groupName: "Sterretjes",
      } as RuleLike,
    ]);
    expect(blocks[0]).toEqual({
      id: blockIdForKey(SLOT_DAY, GROUP_A),
      timeSlotId: SLOT_DAY,
      groupId: GROUP_A,
      days: [1],
    });
  });
});

describe("round trip", () => {
  it("rules -> blocks -> rules is set-identical", () => {
    const rules: RuleLike[] = [
      { day: 0, timeSlotId: SLOT_DAY, groupId: GROUP_A },
      { day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_A },
      { day: 1, timeSlotId: SLOT_MORNING, groupId: GROUP_B },
      { day: 6, timeSlotId: "deleted-slot", groupId: GROUP_B },
    ];
    expect(keys(blocksToRules(rulesToBlocks(rules)))).toEqual(keys(rules));
  });

  it("blocks -> rules -> blocks preserves the same day sets", () => {
    const blocks = [
      block({ id: "b1", timeSlotId: SLOT_DAY, groupId: GROUP_A, days: [1, 2, 4] }),
      block({ id: "b2", timeSlotId: SLOT_MORNING, groupId: GROUP_B, days: [5, 0] }),
    ];
    const restored = rulesToBlocks(blocksToRules(blocks));

    const daySets = (list: readonly ScheduleBlock[]) =>
      list
        .map((b) => `${b.timeSlotId}/${b.groupId}: ${sortDays(b.days).join(",")}`)
        .sort((a, b2) => a.localeCompare(b2));

    expect(daySets(restored)).toEqual(daySets(blocks));
  });
});

describe("canonicaliseRules", () => {
  it("makes two equal rule sets in different order equal", () => {
    const a: RuleLike[] = [
      { day: 4, timeSlotId: SLOT_MORNING, groupId: GROUP_B },
      { day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_A },
    ];
    const b: RuleLike[] = [
      { day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_A },
      { day: 4, timeSlotId: SLOT_MORNING, groupId: GROUP_B },
    ];
    expect(canonicaliseRules(a)).toEqual(canonicaliseRules(b));
  });

  it("projects onto exactly { day, timeSlotId, groupId }", () => {
    expect(
      canonicaliseRules([
        {
          day: 1,
          timeSlotId: SLOT_DAY,
          groupId: GROUP_A,
          timeSlotName: "Hele dag",
          groupName: "Sterretjes",
        } as RuleLike,
      ]),
    ).toEqual([{ day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_A }]);
  });

  it("is idempotent and sorts Sunday last", () => {
    const once = canonicaliseRules([
      { day: 0, timeSlotId: SLOT_DAY, groupId: GROUP_A },
      { day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_A },
    ]);
    expect(once.map((r) => r.day)).toEqual([1, 0]);
    expect(canonicaliseRules(once)).toEqual(once);
  });

  it("does not drop duplicates", () => {
    const duplicated: RuleLike[] = [
      { day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_A },
      { day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_A },
    ];
    expect(canonicaliseRules(duplicated)).toHaveLength(2);
  });
});

describe("takenDaysBySlot", () => {
  const blocks = [
    block({ id: "b1", timeSlotId: SLOT_DAY, groupId: GROUP_A, days: [1, 3] }),
    block({ id: "b2", timeSlotId: SLOT_MORNING, groupId: GROUP_B, days: [1, 5] }),
    block({ id: "b3", timeSlotId: SLOT_DAY, groupId: GROUP_B, days: [0] }),
  ];

  it("blocks only within the same time slot", () => {
    const taken = takenDaysBySlot(blocks);
    expect([...taken.get(SLOT_DAY)!].sort()).toEqual([0, 1, 3]);
    expect([...taken.get(SLOT_MORNING)!].sort()).toEqual([1, 5]);
    expect(taken.get(SLOT_AFTERNOON)).toBeUndefined();
  });

  it("never blocks a block against itself", () => {
    const taken = takenDaysBySlot(blocks, "b1");
    expect([...taken.get(SLOT_DAY)!]).toEqual([0]);
  });

  it("ignores blocks without a time slot", () => {
    const taken = takenDaysBySlot([block({ id: "b1", timeSlotId: "", days: [1, 2] })]);
    expect(taken.size).toBe(0);
  });
});

describe("daysRemovedBySlotChange", () => {
  const blocks = [
    block({ id: "b1", timeSlotId: SLOT_MORNING, groupId: GROUP_A, days: [1, 3, 5] }),
    block({ id: "b2", timeSlotId: SLOT_DAY, groupId: GROUP_B, days: [1, 3] }),
  ];

  it("reports only the colliding days, Monday-first", () => {
    expect(daysRemovedBySlotChange(blocks, "b1", SLOT_DAY)).toEqual([1, 3]);
  });

  it("reports nothing when the new slot is free", () => {
    expect(daysRemovedBySlotChange(blocks, "b1", SLOT_AFTERNOON)).toEqual([]);
    expect(daysRemovedBySlotChange(blocks, "b1", "")).toEqual([]);
  });

  it("mutates nothing and touches no other block", () => {
    const snapshot = structuredClone(blocks);
    daysRemovedBySlotChange(blocks, "b1", SLOT_DAY);
    expect(blocks).toEqual(snapshot);
  });

  it("returns nothing for an unknown block id", () => {
    expect(daysRemovedBySlotChange(blocks, "nope", SLOT_DAY)).toEqual([]);
  });
});

describe("rulesToReplacementBlocks", () => {
  const known = { slots: [SLOT_DAY, SLOT_MORNING], groups: [GROUP_A, GROUP_B] };

  it("replaces the draft with the copied planning", () => {
    const { blocks, skipped } = rulesToReplacementBlocks(
      [
        { day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_A },
        { day: 3, timeSlotId: SLOT_DAY, groupId: GROUP_A },
      ],
      known.slots,
      known.groups,
    );
    expect(skipped).toBe(0);
    expect(blocks).toEqual([
      {
        id: blockIdForKey(SLOT_DAY, GROUP_A),
        timeSlotId: SLOT_DAY,
        groupId: GROUP_A,
        days: [1, 3],
      },
    ]);
  });

  it("skips and counts rules whose slot or group no longer exists", () => {
    const { blocks, skipped } = rulesToReplacementBlocks(
      [
        { day: 1, timeSlotId: "gone", groupId: GROUP_A },
        { day: 2, timeSlotId: SLOT_DAY, groupId: "gone" },
        { day: 3, timeSlotId: SLOT_DAY, groupId: GROUP_A },
      ],
      known.slots,
      known.groups,
    );
    expect(skipped).toBe(2);
    expect(countDagdelen(blocks)).toBe(1);
  });

  it("enforces the invariant on the authoring path: first (day, slot) wins", () => {
    const { blocks, skipped } = rulesToReplacementBlocks(
      [
        { day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_A },
        { day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_B },
      ],
      known.slots,
      known.groups,
    );
    expect(skipped).toBe(1);
    expect(daySlotConflicts(blocks)).toEqual([]);
    expect(countDagdelen(blocks)).toBe(1);
  });

  it("returns an empty replacement for empty input", () => {
    expect(rulesToReplacementBlocks([], known.slots, known.groups)).toEqual({
      blocks: [],
      skipped: 0,
    });
  });
});

describe("overlapWarnings", () => {
  it("warns for two different, time-overlapping slots on a shared day", () => {
    const warnings = overlapWarnings(
      [
        block({ id: "b1", timeSlotId: SLOT_DAY, groupId: GROUP_A, days: [1] }),
        block({ id: "b2", timeSlotId: SLOT_MORNING, groupId: GROUP_A, days: [1] }),
      ],
      timeSlots,
    );
    expect(warnings).toEqual([
      { day: 1, slotA: "Hele dag", slotB: "Ochtend", slotAId: SLOT_DAY, slotBId: SLOT_MORNING },
    ]);
  });

  it("does not warn for adjacent slots that only touch at the boundary", () => {
    expect(
      overlapWarnings(
        [
          block({ id: "b1", timeSlotId: SLOT_MORNING, groupId: GROUP_A, days: [1] }),
          block({ id: "b2", timeSlotId: SLOT_AFTERNOON, groupId: GROUP_A, days: [1] }),
        ],
        timeSlots,
      ),
    ).toEqual([]);
  });

  it("does not warn when the overlapping slots are on different days", () => {
    expect(
      overlapWarnings(
        [
          block({ id: "b1", timeSlotId: SLOT_DAY, groupId: GROUP_A, days: [1] }),
          block({ id: "b2", timeSlotId: SLOT_MORNING, groupId: GROUP_A, days: [2] }),
        ],
        timeSlots,
      ),
    ).toEqual([]);
  });

  it("does not warn about a single slot used across several blocks", () => {
    expect(
      overlapWarnings(
        [
          block({ id: "b1", timeSlotId: SLOT_DAY, groupId: GROUP_A, days: [1] }),
          block({ id: "b2", timeSlotId: SLOT_DAY, groupId: GROUP_B, days: [1] }),
        ],
        timeSlots,
      ),
    ).toEqual([]);
  });

  it("stays silent for incomplete blocks and unknown slots", () => {
    expect(
      overlapWarnings(
        [
          block({ id: "b1", timeSlotId: SLOT_DAY, groupId: GROUP_A, days: [] }),
          block({ id: "b2", timeSlotId: "gone", groupId: GROUP_A, days: [1] }),
        ],
        timeSlots,
      ),
    ).toEqual([]);
  });
});

describe("diffRules", () => {
  const before: RuleLike[] = [
    { day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_A },
    { day: 3, timeSlotId: SLOT_DAY, groupId: GROUP_A },
  ];

  it("returns nothing for identical sets in different order", () => {
    expect(diffRules(before, [...before].reverse())).toEqual({ added: [], removed: [] });
  });

  it("reports a group change as one added plus one removed", () => {
    const after: RuleLike[] = [
      { day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_A },
      { day: 3, timeSlotId: SLOT_DAY, groupId: GROUP_B },
    ];
    expect(diffRules(before, after)).toEqual({
      added: [{ day: 3, timeSlotId: SLOT_DAY, groupId: GROUP_B }],
      removed: [{ day: 3, timeSlotId: SLOT_DAY, groupId: GROUP_A }],
    });
  });

  it("reports pure additions and pure removals", () => {
    expect(diffRules([], before).added).toHaveLength(2);
    expect(diffRules(before, []).removed).toHaveLength(2);
    expect(diffRules(null, undefined)).toEqual({ added: [], removed: [] });
  });

  it("ignores the list VM's extra fields", () => {
    const decorated: RuleLike[] = [
      { day: 1, timeSlotId: SLOT_DAY, groupId: GROUP_A, groupName: "Sterretjes" } as RuleLike,
      { day: 3, timeSlotId: SLOT_DAY, groupId: GROUP_A, startTime: "08:00:00" } as RuleLike,
    ];
    expect(diffRules(decorated, blocksToRules(rulesToBlocks(before)))).toEqual({
      added: [],
      removed: [],
    });
  });
});

describe("countDagdelen", () => {
  it("counts (block, day) pairs, not blocks", () => {
    expect(
      countDagdelen([
        block({ id: "b1", timeSlotId: SLOT_DAY, groupId: GROUP_A, days: [1, 2, 4] }),
        block({ id: "b2", timeSlotId: SLOT_MORNING, groupId: GROUP_B, days: [5] }),
      ]),
    ).toBe(4);
  });

  it("counts nothing for incomplete blocks and de-duplicates days", () => {
    expect(countDagdelen([])).toBe(0);
    expect(countDagdelen([emptyBlock()])).toBe(0);
    expect(countDagdelen([block({ id: "b1", timeSlotId: "", days: [1, 2] })])).toBe(0);
    expect(countDagdelen([block({ id: "b1", days: [1, 1, 2] })])).toBe(2);
  });

  it("always equals the number of wire rules that will be submitted", () => {
    const blocks = [
      block({ id: "b1", timeSlotId: SLOT_DAY, groupId: GROUP_A, days: [1, 2] }),
      block({ id: "b2", timeSlotId: SLOT_MORNING, groupId: GROUP_B, days: [0, 6] }),
      block({ id: "b3", timeSlotId: "", groupId: GROUP_B, days: [3] }),
    ];
    expect(countDagdelen(blocks)).toBe(blocksToRules(blocks).length);
  });
});

describe("block helpers", () => {
  it("emptyBlock is incomplete, has no days and can inherit a group", () => {
    const fresh = emptyBlock(GROUP_A);
    expect(fresh.timeSlotId).toBe("");
    expect(fresh.groupId).toBe(GROUP_A);
    expect(fresh.days).toEqual([]);
    expect(isBlockComplete(fresh)).toBe(false);
    expect(emptyBlock().groupId).toBe("");
  });

  it("createBlockId hands out unique ids", () => {
    const ids = Array.from({ length: 50 }, createBlockId);
    expect(new Set(ids).size).toBe(50);
  });

  it("isBlockComplete needs a slot, a group and at least one day", () => {
    expect(isBlockComplete(block({ id: "b", days: [0] }))).toBe(true);
    expect(isBlockComplete(block({ id: "b", days: [] }))).toBe(false);
    expect(isBlockComplete(block({ id: "b", timeSlotId: "", days: [1] }))).toBe(false);
    expect(isBlockComplete(block({ id: "b", groupId: "", days: [1] }))).toBe(false);
  });
});
