import { memo, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { DeleteOutlined as DeleteOutlinedIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { FormSelect, type FormSelectOption } from "@components/forms";
import { getCategoricalColor } from "@lib/categoricalColor";
import type { DayOfWeek } from "@api/scheduling/models/dayOfWeek";
import { type ScheduleFormValues } from "./scheduleBlocks";
import {
  DOT_SEPARATOR,
  formatDayList,
  formatScheduleTimeRange,
  type GroupOption,
  type SlotOption,
} from "./scheduleFormUtils";
import { DayCheckboxGroup } from "./DayCheckboxGroup";

export type ScheduleBlockCardProps = {
  index: number;
  /** The block's own stable id — never RHF's throwaway field key. */
  blockId: string;
  slots: SlotOption[];
  groups: GroupOption[];
  /**
   * Comma-joined day numbers already claimed in THIS block's time slot by
   * another block. A string rather than a Set so `React.memo` keeps working.
   */
  blockedDaysKey: string;
  /** Already-translated reason for the blocked days, or null. */
  blockedReason: string | null;
  /** Already-translated note after a time-slot change dropped days, or null. */
  removalNote: string | null;
  removable: boolean;
  disabled: boolean;
  onRemove: (index: number) => void;
  /**
   * Fired only for a *user-initiated* time-slot change. Dropping days on a slot
   * change must never be inferred from a value diff: `reset()` (e.g. "Terug naar
   * opgeslagen planning") also changes the value, and treating that as an edit
   * silently deletes days from the restored planning.
   */
  onSlotChange: (blockId: string, nextSlotId: string) => void;
  autoFocusSlot: boolean;
};

/** Separator of the `blockedDaysKey` prop. */
const DAY_KEY_SEPARATOR = ",";

const parseDayKey = (key: string): ReadonlySet<DayOfWeek> =>
  new Set(
    key
      .split(DAY_KEY_SEPARATOR)
      .filter((part) => part.length > 0)
      .map((part) => Number(part) as DayOfWeek),
  );

/**
 * One planningsregel: a time slot, a group and the days they apply to.
 *
 * Declared at module scope and memoised on purpose — this component used to be
 * defined inside the dialog's render body, which remounted the whole subtree on
 * every selection and was the root cause of the focus loss.
 */
export const ScheduleBlockCard = memo(
  ({
    index,
    blockId,
    slots,
    groups,
    blockedDaysKey,
    blockedReason,
    removalNote,
    removable,
    disabled,
    onRemove,
    onSlotChange,
    autoFocusSlot,
  }: ScheduleBlockCardProps) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const { control } = useFormContext<ScheduleFormValues>();
    const block = useWatch({ control, name: `blocks.${index}` });

    const timeSlotId = block?.timeSlotId ?? "";
    const groupId = block?.groupId ?? "";
    const days = useMemo<DayOfWeek[]>(() => block?.days ?? [], [block?.days]);

    const blockedDays = useMemo(() => parseDayKey(blockedDaysKey), [blockedDaysKey]);

    const headingId = `schedule-block-${blockId}-heading`;
    const number = index + 1;

    const slotOptions = useMemo<FormSelectOption[]>(() => {
      const options: FormSelectOption[] = slots.map((slot) => ({
        id: slot.id,
        label: (
          <Box component="span" sx={{ display: "inline-flex", alignItems: "baseline", gap: 1 }}>
            <Box component="span">{slot.name}</Box>
            <Box component="span" sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>
              {formatScheduleTimeRange(slot.startTime, slot.endTime)}
            </Box>
          </Box>
        ),
      }));
      // A rule can reference a time slot that has since been deleted. Keep the
      // value selectable-but-disabled so an innocent start-date edit can never
      // silently drop it; the validate rule below keeps submit disabled.
      if (timeSlotId && !slots.some((slot) => slot.id === timeSlotId)) {
        options.unshift({ id: timeSlotId, label: t("Unknown time slot"), disabled: true });
      }
      return options;
    }, [slots, timeSlotId, t]);

    const groupOptions = useMemo<FormSelectOption[]>(() => {
      const options: FormSelectOption[] = groups.map((group) => ({
        id: group.id,
        label: (
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
            <Box
              aria-hidden="true"
              component="span"
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                flexShrink: 0,
                backgroundColor: getCategoricalColor(group.name, theme),
              }}
            />
            <Box component="span">{group.name}</Box>
          </Box>
        ),
      }));
      if (groupId && !groups.some((group) => group.id === groupId)) {
        options.unshift({ id: groupId, label: t("Unknown group"), disabled: true });
      }
      return options;
    }, [groups, groupId, theme, t]);

    const subtitle = useMemo(() => {
      const slotName = slots.find((slot) => slot.id === timeSlotId)?.name;
      const groupName = groups.find((group) => group.id === groupId)?.name;
      return [slotName, groupName, days.length > 0 ? formatDayList(days, t) : null]
        .filter((part): part is string => Boolean(part))
        .join(DOT_SEPARATOR);
    }, [slots, groups, timeSlotId, groupId, days, t]);

    return (
      <Paper
        component="section"
        variant="outlined"
        aria-labelledby={headingId}
        sx={{ p: 2, borderRadius: 2 }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 1.5 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography id={headingId} component="h3" variant="subtitle2">
              {t("Block {{number}}", { number })}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {removable && (
            <IconButton
              size="small"
              aria-label={t("Remove block {{number}}", { number })}
              onClick={() => onRemove(index)}
              disabled={disabled}
            >
              <DeleteOutlinedIcon fontSize="small" aria-hidden="true" />
            </IconButton>
          )}
        </Stack>

        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect<ScheduleFormValues>
              name={`blocks.${index}.timeSlotId`}
              label={t("Time slot")}
              fullWidth
              required
              disabled={disabled}
              autoFocus={autoFocusSlot}
              onChange={(event) => onSlotChange(blockId, event.target.value)}
              rules={{
                // Explicit `required` so the message is the domain one rather
                // than FormSelect's generic "This field is required".
                required: t("Please select a time slot"),
                validate: (value: unknown) =>
                  (typeof value === "string" && slots.some((slot) => slot.id === value)) ||
                  t("Please select a time slot"),
              }}
              options={slotOptions}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect<ScheduleFormValues>
              name={`blocks.${index}.groupId`}
              label={t("Group")}
              fullWidth
              required
              disabled={disabled}
              rules={{
                required: t("Please select a group"),
                validate: (value: unknown) =>
                  (typeof value === "string" && groups.some((group) => group.id === value)) ||
                  t("Please select a group"),
              }}
              options={groupOptions}
            />
          </Grid>
        </Grid>

        <DayCheckboxGroup
          name={`blocks.${index}.days`}
          blockedDays={blockedDays}
          blockedReason={blockedReason}
          removalNote={removalNote}
          disabled={disabled}
          idPrefix={`schedule-block-${blockId}`}
        />
      </Paper>
    );
  },
);

ScheduleBlockCard.displayName = "ScheduleBlockCard";
