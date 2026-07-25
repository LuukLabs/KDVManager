import { memo, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { CalendarMonth as CalendarMonthIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { FormSection } from "@components/forms";
import { WeeklyScheduleGrid } from "@components/WeeklyScheduleGrid";
import { type ScheduleBlock, type ScheduleFormValues } from "./scheduleBlocks";
import { blocksToPreviewRules, type GroupOption, type SlotOption } from "./scheduleFormUtils";

export type ScheduleWeekOverviewProps = {
  slots: SlotOption[];
  groups: GroupOption[];
};

/**
 * Read-only week preview of the draft, rendered with the very same
 * `WeeklyScheduleGrid` the child's planning page uses, so what the manager
 * approves is what they land on after saving.
 *
 * The mapping itself lives in `scheduleFormUtils.blocksToPreviewRules` so it can
 * be unit-tested without going through this component's markup.
 */
const ScheduleWeekOverviewComponent = ({ slots, groups }: ScheduleWeekOverviewProps) => {
  const { t } = useTranslation();
  const { control } = useFormContext<ScheduleFormValues>();
  const watched = useWatch({ control, name: "blocks" });
  const blocks = useMemo<ScheduleBlock[]>(() => watched ?? [], [watched]);

  const previewRules = useMemo(
    () => blocksToPreviewRules(blocks, slots, groups),
    [blocks, slots, groups],
  );

  return (
    <FormSection title={t("Week overview")} icon={<CalendarMonthIcon aria-hidden="true" />}>
      <Grid size={12}>
        {previewRules.length > 0 ? (
          <WeeklyScheduleGrid scheduleRules={previewRules} />
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("Once you pick days you will see the week overview here.")}
          </Typography>
        )}
      </Grid>
    </FormSection>
  );
};

export const ScheduleWeekOverview = memo(ScheduleWeekOverviewComponent);

ScheduleWeekOverview.displayName = "ScheduleWeekOverview";
