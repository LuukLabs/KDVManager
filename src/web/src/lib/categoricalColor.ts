import { type Theme } from "@mui/material/styles";

/**
 * Maps an arbitrary seed string onto one of the theme's categorical colors.
 *
 * The hash is the djb2-ish variant that used to live (twice) in
 * `components/WeeklyScheduleGrid.tsx` and `components/ChildCard.tsx`. It is
 * lifted VERBATIM so no already-rendered color shifts: `WeeklyScheduleGrid`
 * seeds on the group NAME, `ChildCard` seeds on the child ID, and both keep
 * producing exactly the same palette entry they produced before.
 *
 * Seed choice matters: everything that colors a group must seed on the group
 * name, or the editor and the schedule cards disagree.
 *
 * Contrast: not every categorical hue clears 4.5:1 against white text (see
 * `categoricalColor.test.ts` for the measured table). Use these colors as a
 * decorative fill next to a text label — never as the background of text
 * unless you pair them with `theme.palette.getContrastText(color)`.
 */
export const getCategoricalColor = (seed: string | null | undefined, theme: Theme): string => {
  if (!seed) return theme.customColors.unassigned;

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) & 0xffffffff;
  }
  const { categorical } = theme.customColors;
  return categorical[Math.abs(hash) % categorical.length];
};
