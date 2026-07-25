import { memo, useCallback, useMemo } from "react";
import { useController, useFormContext } from "react-hook-form";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import type { DayOfWeek } from "@api/scheduling/models/dayOfWeek";
import { MONDAY_FIRST_DAYS, WEEKDAYS, sortDays, type ScheduleFormValues } from "./scheduleBlocks";
import { dayLongLabel, dayShortLabel } from "./scheduleFormUtils";

export type DayCheckboxGroupProps = {
  /** RHF path of this block's `days` array. */
  name: `blocks.${number}.days`;
  /**
   * Days already claimed by another planningsregel in the SAME time slot.
   * Their checkboxes are natively disabled — a duplicate is unreachable rather
   * than merely rejected.
   */
  blockedDays: ReadonlySet<DayOfWeek>;
  /** Already-translated persistent reason for the blocked days, or null. */
  blockedReason: string | null;
  /** Already-translated note after a time-slot change dropped days, or null. */
  removalNote: string | null;
  disabled: boolean;
  /** Namespaces every id in this fieldset, so two blocks never collide. */
  idPrefix: string;
};

/**
 * The seven days of one planningsregel: native MUI checkboxes inside a
 * `fieldset` with a `legend`, laid out on a CSS grid.
 *
 * No roving tabindex, no key handling, no ToggleButtonGroup: seven checkboxes
 * are seven plain tab stops and Space toggles them, which is exactly what a
 * multi-select means and what screen-reader users expect.
 */
export const DayCheckboxGroup = memo(
  ({
    name,
    blockedDays,
    blockedReason,
    removalNote,
    disabled,
    idPrefix,
  }: DayCheckboxGroupProps) => {
    const { t } = useTranslation();
    const { control } = useFormContext<ScheduleFormValues>();
    const {
      field,
      fieldState: { error },
    } = useController<ScheduleFormValues, `blocks.${number}.days`>({
      control,
      name,
      rules: {
        validate: (value: DayOfWeek[] | undefined) =>
          (value?.length ?? 0) > 0 || t("Select at least one day"),
      },
    });

    const selected = useMemo<DayOfWeek[]>(() => field.value ?? [], [field.value]);
    const helperId = `${idPrefix}-days-helper`;
    const reasonId = `${idPrefix}-days-reason`;
    const noteId = `${idPrefix}-days-note`;

    const { onChange } = field;

    const toggleDay = useCallback(
      (day: DayOfWeek, checked: boolean, current: DayOfWeek[]) => {
        onChange(checked ? sortDays([...current, day]) : current.filter((entry) => entry !== day));
      },
      [onChange],
    );

    // Add-only and idempotent: unions Monday-Friday minus the blocked days into
    // the current selection. Pressing it twice changes nothing.
    const selectWeekdays = useCallback(() => {
      onChange(sortDays([...selected, ...WEEKDAYS.filter((day) => !blockedDays.has(day))]));
    }, [onChange, selected, blockedDays]);

    return (
      <Box component="fieldset" sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <Typography component="legend" variant="subtitle2" sx={{ p: 0, mb: 0.5 }}>
          {t("Days")}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(4, 1fr)", sm: "repeat(7, 1fr)" },
            gap: 1,
          }}
        >
          {MONDAY_FIRST_DAYS.map((day) => {
            const checked = selected.includes(day);
            // Only *adding* a claimed day is blocked. A day that is already
            // ticked here stays operable even when another planningsregel claims
            // it too, which is the only way a user can repair legacy data that
            // violates the day-per-slot invariant. Disabling it would make such a
            // planning a dead end.
            const blocked = blockedDays.has(day) && !checked;
            // A disabled checkbox is not focusable, so the reason must also sit
            // in its description chain for the tests and for anyone inspecting
            // the tree — the visible text below carries it for everyone else.
            const describedBy =
              [error ? helperId : null, blocked && blockedReason ? reasonId : null]
                .filter(Boolean)
                .join(" ") || undefined;
            return (
              <FormControlLabel
                key={day}
                sx={{ m: 0, minHeight: 48 }}
                disabled={disabled || blocked}
                control={
                  <Checkbox
                    checked={checked}
                    onChange={(event) => toggleDay(day, event.target.checked, selected)}
                    slotProps={{
                      input: {
                        "aria-label": dayLongLabel(day, t),
                        "aria-describedby": describedBy,
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: checked ? 600 : 400 }}>
                    {dayShortLabel(day, t)}
                  </Typography>
                }
              />
            );
          })}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
          <Button
            size="small"
            onClick={selectWeekdays}
            disabled={disabled}
            aria-label={t("Select Monday to Friday")}
          >
            {t("Mon to Fri")}
          </Button>
          <FormHelperText id={helperId} error={!!error} sx={{ m: 0 }}>
            {error?.message ?? t("{{count}} days selected", { count: selected.length })}
          </FormHelperText>
        </Box>
        {blockedReason && (
          <Typography id={reasonId} variant="caption" sx={{ display: "block", mt: 0.5 }}>
            {blockedReason}
          </Typography>
        )}
        {removalNote && (
          <Typography id={noteId} variant="caption" sx={{ display: "block", mt: 0.5 }}>
            {removalNote}
          </Typography>
        )}
        <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "text.secondary" }}>
          {t("These days get the same time slot and group.")}
        </Typography>
      </Box>
    );
  },
);

DayCheckboxGroup.displayName = "DayCheckboxGroup";
