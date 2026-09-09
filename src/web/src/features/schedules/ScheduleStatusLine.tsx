import { memo, useEffect, useMemo, useState } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import {
  countDagdelen,
  overlapWarnings,
  type ScheduleBlock,
  type ScheduleFormValues,
} from "./scheduleBlocks";
import {
  DOT_SEPARATOR,
  dayLongLabel,
  type GroupOption,
  type SlotOption,
} from "./scheduleFormUtils";
import type { LookupState } from "./ScheduleBlocksField";

/** Debounce so a burst of day clicks announces once, not seven times. */
const ANNOUNCE_DELAY_MS = 300;
const LINE_SEPARATOR = "\n";

export type ScheduleStatusLineProps = {
  mode: "add" | "edit";
  /** Needed for the overlap check, which compares slot clock ranges. */
  slots: SlotOption[];
  /** Needed to spot a block pointing at a group that no longer exists. */
  groups: GroupOption[];
  lookupState: LookupState;
  /** Transient result of "Huidige planning kopiëren", or null. */
  notice: string | null;
};

/**
 * The dialog's ONE live region. It carries the lookup state, "Nog nodig: …",
 * the recap, the copy result and the non-blocking overlap notes — which is how
 * a screen-reader user learns why the unfocusable disabled submit is blocked.
 *
 * There is deliberately no second `role="status"` anywhere in the dialog: two
 * polite regions announce twice and the reason for a blocked submit gets lost.
 */
const ScheduleStatusLineComponent = ({
  mode,
  slots,
  groups,
  lookupState,
  notice,
}: ScheduleStatusLineProps) => {
  const { t } = useTranslation();
  const { control } = useFormContext<ScheduleFormValues>();
  const { isDirty } = useFormState({ control });
  const watchedBlocks = useWatch({ control, name: "blocks" });
  const startDate = useWatch({ control, name: "startDate" });
  const blocks = useMemo<ScheduleBlock[]>(() => watchedBlocks ?? [], [watchedBlocks]);

  const lines: string[] = [];

  if (lookupState === "error") {
    lines.push(t("Time slots and groups could not be loaded."));
  } else if (lookupState === "pending") {
    lines.push(t("Loading time slots and groups..."));
  } else {
    const missing: string[] = [];
    if (!startDate) missing.push(t("a start date"));
    // A deleted slot/group leaves a non-empty id that fails the card's validate
    // rule. Without naming it here the submit button is disabled with no stated
    // reason, which is exactly the case this line exists for.
    const slotExists = (id: string) => slots.some((slot) => slot.id === id);
    const groupExists = (id: string) => groups.some((group) => group.id === id);
    blocks.forEach((block, index) => {
      const number = index + 1;
      if (!block.timeSlotId) missing.push(t("a time slot in block {{number}}", { number }));
      else if (!slotExists(block.timeSlotId))
        missing.push(t("a time slot that still exists in block {{number}}", { number }));
      if (!block.groupId) missing.push(t("a group in block {{number}}", { number }));
      else if (!groupExists(block.groupId))
        missing.push(t("a group that still exists in block {{number}}", { number }));
      if (block.days.length === 0) missing.push(t("days in block {{number}}", { number }));
    });

    if (mode === "edit" && !isDirty) {
      lines.push(t("You have not changed anything yet."));
    } else if (missing.length > 0) {
      lines.push(t("Still needed: {{items}}", { items: missing.join(DOT_SEPARATOR) }));
    } else {
      lines.push(
        [
          t("{{count}} day parts", { count: countDagdelen(blocks) }),
          t("Repeats weekly from {{date}}", { date: dayjs(startDate).format("DD-MM-YYYY") }),
        ].join(DOT_SEPARATOR),
      );
    }

    overlapWarnings(blocks, slots).forEach((warning) => {
      lines.push(
        t("{{slotA}} and {{slotB}} overlap on {{day}}.", {
          slotA: warning.slotA,
          slotB: warning.slotB,
          day: dayLongLabel(warning.day, t).toLocaleLowerCase(),
        }),
      );
    });
  }

  if (notice) lines.push(notice);

  const message = lines.join(LINE_SEPARATOR);
  const [announced, setAnnounced] = useState(message);

  useEffect(() => {
    const timer = setTimeout(() => setAnnounced(message), ANNOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [message]);

  const shown = announced.length > 0 ? announced.split(LINE_SEPARATOR) : [];

  return (
    <Box
      role="status"
      aria-live="polite"
      aria-atomic="true"
      sx={{ flex: 1, minWidth: 0, textAlign: "left" }}
    >
      {shown.map((line) => (
        <Typography key={line} variant="caption" component="p" sx={{ color: "text.secondary" }}>
          {line}
        </Typography>
      ))}
    </Box>
  );
};

export const ScheduleStatusLine = memo(ScheduleStatusLineComponent);

ScheduleStatusLine.displayName = "ScheduleStatusLine";
