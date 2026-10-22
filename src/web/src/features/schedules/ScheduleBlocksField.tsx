import { memo, useCallback, useMemo, useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  Add as AddIcon,
  ContentCopy as ContentCopyIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { FormSection } from "@components/forms";
import type { ChildScheduleListVMScheduleRule } from "@api/scheduling/models/childScheduleListVMScheduleRule";
import {
  MONDAY_FIRST_DAYS,
  daysRemovedBySlotChange,
  emptyBlock,
  rulesToReplacementBlocks,
  sortDays,
  takenDaysBySlot,
  type ScheduleBlock,
  type ScheduleFormValues,
} from "./scheduleBlocks";
import {
  DOT_SEPARATOR,
  formatDayList,
  type GroupOption,
  type SlotOption,
} from "./scheduleFormUtils";
import { ScheduleBlockCard } from "./ScheduleBlockCard";

/** Separator of the `blockedDaysKey` prop handed to a card. */
const DAY_KEY_SEPARATOR = ",";

/** Routes the setup panels link to when a lookup is empty. */
const TIME_SLOTS_SETTINGS_PATH = "/settings/scheduling";
const GROUPS_SETTINGS_PATH = "/settings/groups";

export type LookupState = "pending" | "error" | "ready";

export type ScheduleBlocksFieldProps = {
  mode: "add" | "edit";
  slots: SlotOption[];
  groups: GroupOption[];
  lookupState: LookupState;
  /** True when a lookup came back at the 100-row cap. */
  truncated: boolean;
  onRetryLookups: () => void;
  /**
   * Add mode only: the rules of the schedule that is active today, or null.
   * Feeds "Huidige planning kopiëren".
   */
  copyableRules: ChildScheduleListVMScheduleRule[] | null;
  /**
   * Routes a transient message to the dialog's single live region. Used for the
   * copy result and for "days were dropped because of a slot change", so a
   * screen-reader user hears about a silent data change. Each new notice
   * replaces the previous one, so nothing goes stale.
   */
  onNotice: (message: string | null) => void;
  disabled: boolean;
};

/**
 * "The user has not put anything in this planningsregel yet."
 *
 * Keyed on days alone, deliberately. The slot and group can both be prefilled
 * without any user action — a new planningsregel inherits the previous one's
 * group, and a tenant with exactly one slot or group gets it auto-selected — so
 * testing those made this predicate permanently false, which silently disabled
 * the "fill in the last row first" guard and made "Huidige planning kopiëren"
 * demand confirmation on an untouched dialog. A block without days also
 * contributes no rules, so this matches what actually gets saved.
 */
const blockIsEmpty = (block: ScheduleBlock): boolean => block.days.length === 0;

/** Returns `source` without `key`, leaving the original untouched. */
const omitKey = <T,>(source: Record<string, T>, key: string): Record<string, T> =>
  key in source
    ? Object.fromEntries(Object.entries(source).filter(([entryKey]) => entryKey !== key))
    : source;

const ScheduleBlocksFieldComponent = ({
  mode,
  slots,
  groups,
  lookupState,
  truncated,
  onRetryLookups,
  copyableRules,
  onNotice,
  disabled,
}: ScheduleBlocksFieldProps) => {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<ScheduleFormValues>();
  // `keyName: "_rhfKey"` is load-bearing: with RHF's default of "id" the
  // `fields` view would shadow ScheduleBlock.id with a throwaway key, and every
  // per-block lookup (blocked days, ids, refs) would silently stop matching.
  const { fields, append, remove, replace } = useFieldArray<
    ScheduleFormValues,
    "blocks",
    "_rhfKey"
  >({ control, name: "blocks", keyName: "_rhfKey" });
  const watched = useWatch({ control, name: "blocks" });
  const blocks = useMemo<ScheduleBlock[]>(() => watched ?? [], [watched]);

  const [autoFocusBlockId, setAutoFocusBlockId] = useState<string | null>(null);
  const [removalNotes, setRemovalNotes] = useState<Record<string, string>>({});
  const [skippedNote, setSkippedNote] = useState<string | null>(null);
  const [confirmCopy, setConfirmCopy] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement | null>(null);

  const slotNameById = useMemo(() => new Map(slots.map((slot) => [slot.id, slot.name])), [slots]);
  const slotIds = useMemo(() => slots.map((slot) => slot.id), [slots]);
  const groupIds = useMemo(() => groups.map((group) => group.id), [groups]);

  /**
   * A user picked a different time slot for one planningsregel. Any day that is
   * already claimed in the NEW slot by another planningsregel has to leave this
   * one, or the day-per-slot invariant would break.
   *
   * Driven by the select's real change event rather than by diffing values in an
   * effect: `reset()` ("Terug naar opgeslagen planning") and `replace()` (copy)
   * both rewrite slot values without any user intent, and treating those as
   * edits silently deleted days from the restored planning and then marked the
   * form dirty, so the deletion got saved.
   */
  const handleSlotChange = useCallback(
    (blockId: string, nextSlotId: string) => {
      const index = blocks.findIndex((block) => block.id === blockId);
      if (index < 0) return;

      setRemovalNotes((current) => omitKey(current, blockId));
      if (!nextSlotId) return;

      const dropped = daysRemovedBySlotChange(blocks, blockId, nextSlotId);
      if (dropped.length === 0) return;

      const droppedSet = new Set(dropped);
      setValue(
        `blocks.${index}.days`,
        (blocks[index]?.days ?? []).filter((day) => !droppedSet.has(day)),
        { shouldDirty: true, shouldValidate: true },
      );
      const message = t("{{days}} removed: already planned in {{slot}}", {
        days: formatDayList(dropped, t),
        slot: slotNameById.get(nextSlotId) ?? t("Unknown time slot"),
      });
      setRemovalNotes((current) => ({ ...current, [blockId]: message }));
      // Also announced, because days disappearing is a silent data change and the
      // per-block caption is not in a live region.
      onNotice(message);
    },
    [blocks, setValue, slotNameById, onNotice, t],
  );

  const handleRemove = useCallback(
    (index: number) => {
      const removedId = blocks[index]?.id;
      remove(index);
      // A note about a day dropped because of this planningsregel is meaningless
      // once it is gone.
      if (removedId) {
        setRemovalNotes((current) => omitKey(current, removedId));
      }
      // The add button may still be disabled in this commit (it re-enables once
      // the removal renders), and focusing a disabled button silently drops
      // focus to <body>. Wait for the commit.
      requestAnimationFrame(() => addButtonRef.current?.focus());
    },
    [remove, blocks],
  );

  const handleAddBlock = useCallback(() => {
    const previous = blocks[blocks.length - 1];
    const next = emptyBlock(previous?.groupId ?? "");
    append(next);
    setAutoFocusBlockId(next.id);
  }, [append, blocks]);

  const lastBlock = blocks[blocks.length - 1];
  const lastBlockEmpty = Boolean(lastBlock) && blockIsEmpty(lastBlock);
  const everyDaySlotTaken = useMemo(() => {
    if (slots.length === 0) return false;
    const taken = takenDaysBySlot(blocks);
    return slots.every((slot) => (taken.get(slot.id)?.size ?? 0) >= MONDAY_FIRST_DAYS.length);
  }, [blocks, slots]);

  const addBlockReason = lastBlockEmpty
    ? t("Fill in block {{number}} first", { number: blocks.length })
    : everyDaySlotTaken
      ? // Fires only when EVERY configured slot is fully booked, so the message
        // must say that rather than naming a single slot.
        t("All days are already planned in every time slot")
      : null;
  const addBlockDisabled = disabled || lookupState !== "ready" || Boolean(addBlockReason);

  const copyPreview = useMemo(() => {
    if (mode !== "add" || !copyableRules || copyableRules.length === 0) return null;
    const { blocks: preview } = rulesToReplacementBlocks(copyableRules, slotIds, groupIds);
    if (preview.length === 0) return null;
    return preview
      .map((block) =>
        [
          formatDayList(block.days, t),
          slotNameById.get(block.timeSlotId) ?? "",
          groups.find((group) => group.id === block.groupId)?.name ?? "",
        ]
          .filter((part) => part.length > 0)
          .join(DOT_SEPARATOR),
      )
      .join(DOT_SEPARATOR);
  }, [mode, copyableRules, slotIds, groupIds, slotNameById, groups, t]);

  const draftIsEmpty = blocks.every(blockIsEmpty);

  const applyCopy = useCallback(() => {
    const { blocks: replacement, skipped } = rulesToReplacementBlocks(
      copyableRules,
      slotIds,
      groupIds,
    );
    replace(replacement.length > 0 ? replacement : [emptyBlock()]);
    setRemovalNotes({});
    setConfirmCopy(false);
    setSkippedNote(
      skipped > 0
        ? t("{{count}} day parts were skipped because the time slot or group no longer exists", {
            count: skipped,
          })
        : null,
    );
    onNotice(t("Current planning copied"));
  }, [copyableRules, slotIds, groupIds, replace, onNotice, t]);

  const handleCopyClick = useCallback(() => {
    if (draftIsEmpty) {
      applyCopy();
      return;
    }
    setConfirmCopy(true);
  }, [draftIsEmpty, applyCopy]);

  const renderBody = () => {
    if (lookupState === "error") {
      return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Stack sx={{ gap: 1, alignItems: "flex-start" }}>
            <Typography variant="body2">
              {t("Time slots and groups could not be loaded.")}
            </Typography>
            <Button variant="outlined" size="small" onClick={onRetryLookups}>
              {t("Try again")}
            </Button>
          </Stack>
        </Paper>
      );
    }

    if (lookupState === "pending") {
      return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction="row" sx={{ gap: 2, mb: 2 }}>
            <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
            <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(4, 1fr)", sm: "repeat(7, 1fr)" },
              gap: 1,
            }}
          >
            {MONDAY_FIRST_DAYS.map((day) => (
              <Skeleton key={day} variant="rounded" height={40} />
            ))}
          </Box>
          <Stack direction="row" sx={{ gap: 1, alignItems: "center", mt: 2 }}>
            <CircularProgress size={16} aria-hidden="true" />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t("Loading time slots and groups...")}
            </Typography>
          </Stack>
        </Paper>
      );
    }

    if (slots.length === 0 || groups.length === 0) {
      return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Stack sx={{ gap: 1, alignItems: "flex-start" }}>
            {slots.length === 0 && (
              <>
                <Typography variant="body2">
                  {t("No time slots configured yet. Set one up before you create a schedule.")}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  component={RouterLink}
                  to={TIME_SLOTS_SETTINGS_PATH}
                >
                  {t("Manage time slots")}
                </Button>
              </>
            )}
            {groups.length === 0 && (
              <>
                <Typography variant="body2">
                  {t("No groups configured yet. Set one up before you create a schedule.")}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  component={RouterLink}
                  to={GROUPS_SETTINGS_PATH}
                >
                  {t("Manage groups")}
                </Button>
              </>
            )}
          </Stack>
        </Paper>
      );
    }

    return (
      <Stack sx={{ gap: 2 }}>
        {fields.map((field, index) => {
          const block = blocks[index] ?? field;
          const taken = block.timeSlotId
            ? takenDaysBySlot(blocks, block.id).get(block.timeSlotId)
            : undefined;
          const blockedDays = taken ? sortDays([...taken]) : [];
          return (
            <ScheduleBlockCard
              key={field.id}
              index={index}
              blockId={field.id}
              slots={slots}
              groups={groups}
              blockedDaysKey={blockedDays.join(DAY_KEY_SEPARATOR)}
              blockedReason={
                blockedDays.length > 0
                  ? t("Already planned in {{slot}}: {{days}}", {
                      slot: slotNameById.get(block.timeSlotId) ?? t("Unknown time slot"),
                      days: formatDayList(blockedDays, t),
                    })
                  : null
              }
              removalNote={removalNotes[field.id] ?? null}
              removable={fields.length > 1}
              disabled={disabled}
              onRemove={handleRemove}
              onSlotChange={handleSlotChange}
              autoFocusSlot={autoFocusBlockId === field.id}
            />
          );
        })}

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            ref={addButtonRef}
            variant="outlined"
            startIcon={<AddIcon aria-hidden="true" />}
            onClick={handleAddBlock}
            disabled={addBlockDisabled}
          >
            {t("Add block")}
          </Button>
          {addBlockReason && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {addBlockReason}
            </Typography>
          )}
        </Box>
      </Stack>
    );
  };

  return (
    <FormSection title={t("Schedule Rules")} icon={<ScheduleIcon aria-hidden="true" />}>
      {copyPreview && (
        <Grid size={12}>
          <Stack sx={{ gap: 0.5, alignItems: "flex-start" }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ContentCopyIcon aria-hidden="true" />}
              onClick={handleCopyClick}
              disabled={disabled}
            >
              {t("Copy current planning")}
            </Button>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t("Copies: {{summary}}", { summary: copyPreview })}
            </Typography>
            {confirmCopy && (
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, width: "100%" }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {t("Replace your draft with the current planning?")}
                </Typography>
                <Stack direction="row" sx={{ gap: 1 }}>
                  <Button variant="contained" size="small" onClick={applyCopy}>
                    {t("Replace draft")}
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => setConfirmCopy(false)}>
                    {t("Cancel", { ns: "common" })}
                  </Button>
                </Stack>
              </Paper>
            )}
            {skippedNote && <Typography variant="caption">{skippedNote}</Typography>}
          </Stack>
        </Grid>
      )}
      {truncated && (
        <Grid size={12}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {t("Not all time slots or groups are shown.")}
          </Typography>
        </Grid>
      )}
      <Grid size={12}>{renderBody()}</Grid>
    </FormSection>
  );
};

export const ScheduleBlocksField = memo(ScheduleBlocksFieldComponent);

ScheduleBlocksField.displayName = "ScheduleBlocksField";
