/**
 * The vocabulary of one child's day on the planning board.
 *
 * "Aanwezigheid" is already taken by the printed month plan
 * ("aanwezigheidsplanningen"), and "aanwezig" cannot be the plain antonym of
 * "afwezig" here because a child can be reported absent *and* still turn up.
 * So the states are named after arrival rather than presence, and absence keeps
 * the word it already has in the UI.
 */
export type DagdeelStatus =
  /** Planned, nothing observed yet. — Verwacht */
  | "expected"
  /** An Absence covers this date. Declared in advance. — Afgemeld */
  | "reportedAbsent"
  /** Checked in. — Aangekomen */
  | "arrived"
  /** Checked out. — Opgehaald */
  | "departed"
  /** Planned end passed with no registration. — Niet gekomen */
  | "noShow"
  /** A closure period covers this date; forced onto every row. — Gesloten */
  | "closed";

/**
 * One child × one date × one time slot — a *dagdeel*, the word the planning
 * side already uses. This is the unit the board renders and the unit a future
 * attendance registration attaches to.
 *
 * Deliberately flat: the board is the only consumer, and a flat row keeps the
 * status derivation in one readable place.
 */
export type DagdeelRow = {
  /**
   * `${childId}:${groupId}:${timeSlotId}` — NOT scheduleId. Rows are schedule
   * *rules*, and every rule of one schedule shares its ScheduleId, so a child
   * planned for both ochtend and middag in one group yields two rows that
   * would otherwise collide as React keys.
   */
  key: string;
  /** Null once presence without a plan (a ruildag) becomes representable. */
  scheduleId: string | null;
  childId: string;
  childFullName: string;
  groupId: string;
  timeSlotId: string;
  timeSlotName: string;
  /** "HH:mm:ss" as the API returns it. */
  plannedStart: string;
  plannedEnd: string;
  age?: number;
  status: DagdeelStatus;
  absenceReason?: string | null;
  /**
   * Always null today — no endpoint can supply them yet. Typed now so the card
   * that renders them does not change shape when attendance lands.
   */
  actualStart?: string | null;
  actualEnd?: string | null;
};

export type GroupBoard = {
  groupId: string;
  groupName: string;
  /** Ordered: arrived, expected, noShow, then reportedAbsent last. */
  rows: DagdeelRow[];
  /** Over DISTINCT children — a child with two dagdelen counts once. */
  countsByStatus: Record<DagdeelStatus, number>;
};

/** Rank within a column. Backend order (oldest child first) holds inside a rank. */
export const STATUS_ORDER: Record<DagdeelStatus, number> = {
  arrived: 0,
  departed: 1,
  expected: 2,
  noShow: 3,
  reportedAbsent: 4,
  closed: 5,
};

export const emptyStatusCounts = (): Record<DagdeelStatus, number> => ({
  expected: 0,
  reportedAbsent: 0,
  arrived: 0,
  departed: 0,
  noShow: 0,
  closed: 0,
});
