import { memo, useMemo } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import type { TFunction } from "i18next";
import {
  blocksToRules,
  diffRules,
  ruleKey,
  type CanonicalRule,
  type RuleLike,
  type ScheduleBlock,
  type ScheduleFormValues,
} from "./scheduleBlocks";
import {
  DOT_SEPARATOR,
  dayShortLabel,
  type GroupOption,
  type SlotOption,
} from "./scheduleFormUtils";

/** Chips beyond this count collapse into a single "+{{count}} meer". */
const MAX_CHIPS = 5;

export type ScheduleChangeSummaryProps = {
  /** The stored rules this edit is diffed against. */
  initialRules: RuleLike[];
  slots: SlotOption[];
  groups: GroupOption[];
};

const ruleLabel = (
  rule: CanonicalRule,
  slots: readonly SlotOption[],
  groups: readonly GroupOption[],
  t: TFunction,
): string =>
  [
    dayShortLabel(rule.day, t),
    slots.find((slot) => slot.id === rule.timeSlotId)?.name ?? t("Unknown time slot"),
    groups.find((group) => group.id === rule.groupId)?.name ?? t("Unknown group"),
  ].join(DOT_SEPARATOR);

/**
 * Edit mode only. The PUT replaces the whole rule collection, so the user is
 * told exactly that, plus what the replacement adds and removes.
 */
const ScheduleChangeSummaryComponent = ({
  initialRules,
  slots,
  groups,
}: ScheduleChangeSummaryProps) => {
  const { t } = useTranslation();
  const { control } = useFormContext<ScheduleFormValues>();
  const { isDirty } = useFormState({ control });
  const watchedBlocks = useWatch({ control, name: "blocks" });
  const startDate = useWatch({ control, name: "startDate" });
  const blocks = useMemo<ScheduleBlock[]>(() => watchedBlocks ?? [], [watchedBlocks]);

  const { added, removed } = useMemo(
    () => diffRules(initialRules, blocksToRules(blocks)),
    [initialRules, blocks],
  );

  if (!isDirty) return null;

  const renderChips = (heading: string, rules: CanonicalRule[]) => (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="subtitle2" component="h3">
        {heading}
      </Typography>
      <Stack direction="row" sx={{ gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
        {rules.slice(0, MAX_CHIPS).map((rule) => (
          <Chip
            key={ruleKey(rule)}
            size="small"
            variant="outlined"
            label={ruleLabel(rule, slots, groups, t)}
          />
        ))}
        {rules.length > MAX_CHIPS && (
          <Chip
            size="small"
            variant="outlined"
            label={t("+{{count}} more", { count: rules.length - MAX_CHIPS })}
          />
        )}
      </Stack>
    </Box>
  );

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="body2">
        {t("You are replacing the whole weekly pattern from {{date}}.", {
          date: startDate ? dayjs(startDate).format("DD-MM-YYYY") : "",
        })}
      </Typography>
      <Stack sx={{ gap: 1.5, mt: 1.5 }}>
        {added.length > 0 && renderChips(t("Added"), added)}
        {removed.length > 0 && renderChips(t("Removed"), removed)}
      </Stack>
    </Paper>
  );
};

export const ScheduleChangeSummary = memo(ScheduleChangeSummaryComponent);

ScheduleChangeSummary.displayName = "ScheduleChangeSummary";
