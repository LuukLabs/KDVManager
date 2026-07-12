import type { Locator } from "@playwright/test";

/**
 * Fill a MUI X (v7+ accessible DOM structure) date field.
 *
 * The field renders as role="group" (named after its label) containing one
 * role="spinbutton" per date section. The app uses the dayjs adapter with
 * adapterLocale="nl", so the section order is DD-MM-YYYY. Clicking the first
 * section and typing the digits lets the field auto-advance between sections.
 *
 * @param group the role="group" locator of the date field
 * @param date date in "DD-MM-YYYY" (separators are stripped before typing)
 */
export async function fillMuiDateField(group: Locator, date: string): Promise<void> {
  await group.getByRole("spinbutton").first().click();
  await group.page().keyboard.type(date.replace(/\D/g, ""));
  // MUI commits section-based keyboard input on blur. Keep the current focus
  // (the year section after auto-advance) and tab past the calendar button so
  // the complete field loses focus before the test continues.
  await group.page().keyboard.press("Tab");
  await group.page().keyboard.press("Tab");
}
