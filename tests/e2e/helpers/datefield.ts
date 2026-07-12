import type { Locator } from "@playwright/test";

/**
 * Fill a MUI X (v7+ accessible DOM structure) date field.
 *
 * The field renders as role="group" (named after its label) containing one
 * role="spinbutton" per date section. Fill each section explicitly: bulk
 * keyboard input can be discarded when React rerenders the controlled MUI
 * field between section updates.
 *
 * @param group the role="group" locator of the date field
 * @param date date in "DD-MM-YYYY" (separators are stripped before typing)
 */
export async function fillMuiDateField(group: Locator, date: string): Promise<void> {
  const [day, month, year] = date.split("-");
  if (!day || !month || !year) {
    throw new Error(`Expected a DD-MM-YYYY date, received: ${date}`);
  }

  await group.getByRole("spinbutton", { name: "Day" }).fill(day);
  await group.getByRole("spinbutton", { name: "Month" }).fill(month);
  await group.getByRole("spinbutton", { name: "Year" }).fill(year);

  // Leave the field so MUI commits its section state before the next action.
  await group.page().keyboard.press("Tab");
  await group.page().keyboard.press("Tab");
}
