/**
 * Time slots settings page (/settings/scheduling).
 *
 * Covered use cases:
 * - Add a time slot through the "Tijdslot toevoegen" dialog (name + start/end
 *   time via the MUI TimeField sections) and see the row with name and
 *   HH:mm-formatted times, plus the "Tijdslot toegevoegd" snackbar.
 * - Edit a time slot through the row edit action ("Bewerken") and the
 *   "Bewerk tijdslot" dialog; the renamed row appears, the old name is gone.
 * - Delete a time slot through the row delete action, including the
 *   confirmation dialog ("Verwijder tijdslot '<naam>'"), and see the row gone.
 * - Cleanup: leftover time slots created by this spec are removed via the API.
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { gotoApp } from "../helpers/app";
import { Api, uniqueName } from "../helpers/api";

type PagedList<T> = { value: T[]; meta: { total: number } };
type TimeSlotRow = { id: string; name?: string };

let api: Api;
/** Names of time slots that may be left behind (cleaned up by name). */
const createdNames = new Set<string>();

test.beforeAll(async () => {
  api = await Api.create();
});

test.afterAll(async () => {
  try {
    const timeSlots = await api.get<PagedList<TimeSlotRow>>(
      "/scheduling/v1/timeslots?pageNumber=1&pageSize=100",
    );
    for (const timeSlot of timeSlots.value) {
      if (timeSlot.name && createdNames.has(timeSlot.name)) {
        try {
          await api.deleteTimeSlot(timeSlot.id);
        } catch {
          // Already deleted through the UI — fine.
        }
      }
    }
  } catch {
    // Best-effort cleanup only.
  }
  await api.dispose();
});

/**
 * Type a time into a MUI X TimeField (accessible DOM structure: a group of
 * hour/minute spinbutton sections, display format HH:mm). Clicking the first
 * section focuses it; typed digits fill a section and auto-advance.
 */
async function typeTime(page: Page, field: Locator, digits: string): Promise<void> {
  await field.getByRole("spinbutton").first().click();
  await page.keyboard.type(digits);
}

test("add a time slot via dialog", async ({ page }) => {
  const name = uniqueName("slot");
  createdNames.add(name);

  await gotoApp(page, "/settings/scheduling");
  await page.getByRole("button", { name: "Tijdslot", exact: true }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Tijdslot toevoegen" })).toBeVisible();
  await dialog.getByLabel("Naam", { exact: true }).fill(name);
  await typeTime(page, dialog.getByRole("group", { name: "Starttijd" }), "0815");
  await typeTime(page, dialog.getByRole("group", { name: "Eindtijd" }), "1230");
  await dialog.getByRole("button", { name: "Toevoegen" }).click();

  await expect(page.getByText("Tijdslot toegevoegd")).toBeVisible();
  const row = page.getByRole("row").filter({ hasText: name });
  await expect(row.getByRole("gridcell", { name, exact: true })).toBeVisible();
  await expect(row.getByRole("gridcell", { name: "08:15", exact: true })).toBeVisible();
  await expect(row.getByRole("gridcell", { name: "12:30", exact: true })).toBeVisible();
});

test("edit a time slot", async ({ page }) => {
  const name = uniqueName("slot");
  const newName = uniqueName("slot-edit");
  createdNames.add(name);
  createdNames.add(newName);
  await api.createTimeSlot({ name, startTime: "09:00:00", endTime: "17:00:00" });

  await gotoApp(page, "/settings/scheduling");
  const row = page.getByRole("row").filter({ hasText: name });
  await row.getByRole("button", { name: "Bewerken" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Bewerk tijdslot" })).toBeVisible();
  await dialog.getByLabel("Naam", { exact: true }).fill(newName);
  await dialog.getByRole("button", { name: "Bijwerken" }).click();

  await expect(page.getByText("Tijdslot bijgewerkt")).toBeVisible();
  await expect(page.getByRole("gridcell", { name: newName, exact: true })).toBeVisible();
  await expect(page.getByRole("gridcell", { name, exact: true })).toBeHidden();
});

test("delete a time slot", async ({ page }) => {
  const name = uniqueName("slot");
  createdNames.add(name);
  await api.createTimeSlot({ name, startTime: "07:30:00", endTime: "13:00:00" });

  await gotoApp(page, "/settings/scheduling");
  const row = page.getByRole("row").filter({ hasText: name });
  await row.getByRole("button", { name: "Verwijder tijdslot" }).click();

  const confirmDialog = page.getByRole("dialog");
  await expect(
    confirmDialog.getByRole("heading", { name: `Verwijder tijdslot '${name}'` }),
  ).toBeVisible();
  await confirmDialog.getByRole("button", { name: "Verwijderen", exact: true }).click();

  await expect(page.getByText(`Tijdslot '${name}' is succesvol verwijderd.`)).toBeVisible();
  await expect(page.getByRole("gridcell", { name, exact: true })).toBeHidden();
});
