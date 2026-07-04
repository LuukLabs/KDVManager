/**
 * Closure periods settings page (/settings/closure-periods).
 *
 * Covered use cases:
 * - Add a closure period through the "Sluitingsperiode toevoegen" dialog
 *   (reason + start/end date via the MUI DatePicker sections, nl format
 *   DD-MM-YYYY) and see the row with the reason and YYYY-MM-DD-formatted
 *   dates, plus the "Sluitingsperiode toegevoegd" snackbar.
 * - Delete a closure period through the row delete action, including the
 *   confirmation dialog ("Verwijder sluitingsperiode"), and see the row gone.
 * - Cleanup: leftover closure periods created by this spec are removed via
 *   the API.
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { gotoApp } from "../helpers/app";
import { Api, uniqueName } from "../helpers/api";

type ClosurePeriodRow = { id: string; reason?: string };

let api: Api;
/** Reasons of closure periods that may be left behind (cleaned up by reason). */
const createdReasons = new Set<string>();

test.beforeAll(async () => {
  api = await Api.create();
});

test.afterAll(async () => {
  try {
    const periods = await api.get<ClosurePeriodRow[]>("/scheduling/v1/closure-periods");
    for (const period of periods) {
      if (period.reason && createdReasons.has(period.reason)) {
        try {
          await api.deleteClosurePeriod(period.id);
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
 * Type a date into a MUI X DatePicker field (accessible DOM structure: a
 * group of day/month/year spinbutton sections; nl display format DD-MM-YYYY,
 * so type DDMMYYYY). Clicking the first section focuses it; typed digits fill
 * a section and auto-advance.
 */
async function typeDate(page: Page, field: Locator, ddmmyyyy: string): Promise<void> {
  await field.getByRole("spinbutton").first().click();
  await page.keyboard.type(ddmmyyyy);
}

test("add a closure period via dialog", async ({ page }) => {
  const reason = uniqueName("sluiting");
  createdReasons.add(reason);

  await gotoApp(page, "/settings/closure-periods");
  await page.getByRole("button", { name: "Sluitingsperiode toevoegen" }).click();

  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Sluitingsperiode toevoegen" }),
  ).toBeVisible();
  await dialog.getByLabel("Reden", { exact: true }).fill(reason);
  // 27-12-2030 t/m 31-12-2030 (far in the future, away from other test data).
  await typeDate(page, dialog.getByRole("group", { name: "Startdatum" }), "27122030");
  await typeDate(page, dialog.getByRole("group", { name: "Einddatum" }), "31122030");
  await dialog.getByRole("button", { name: "Toevoegen" }).click();

  await expect(page.getByText("Sluitingsperiode toegevoegd")).toBeVisible();
  const row = page.getByRole("row").filter({ hasText: reason });
  await expect(row.getByRole("gridcell", { name: reason, exact: true })).toBeVisible();
  // The table formats dates as DD-MM-YYYY (the shared formatDate util).
  await expect(row.getByRole("gridcell", { name: "27-12-2030", exact: true })).toBeVisible();
  await expect(row.getByRole("gridcell", { name: "31-12-2030", exact: true })).toBeVisible();
});

test("delete a closure period", async ({ page }) => {
  const reason = uniqueName("sluiting");
  createdReasons.add(reason);
  await api.createClosurePeriod({
    startDate: "2031-01-02",
    endDate: "2031-01-03",
    reason,
  });

  await gotoApp(page, "/settings/closure-periods");
  const row = page.getByRole("row").filter({ hasText: reason });
  await row.getByRole("button", { name: "Verwijder sluitingsperiode" }).click();

  const confirmDialog = page.getByRole("dialog");
  await expect(
    confirmDialog.getByRole("heading", { name: "Verwijder sluitingsperiode" }),
  ).toBeVisible();
  await confirmDialog.getByRole("button", { name: "Verwijderen", exact: true }).click();

  await expect(page.getByText("Sluitingsperiode is succesvol verwijderd")).toBeVisible();
  await expect(page.getByRole("gridcell", { name: reason, exact: true })).toBeHidden();
});
