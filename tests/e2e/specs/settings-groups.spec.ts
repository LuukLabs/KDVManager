/**
 * Groups settings page (/settings/groups).
 *
 * Covered use cases:
 * - Add a group through the "Groep toevoegen" dialog and see the new row in
 *   the DataGrid, with the "Groep toegevoegd" success snackbar.
 * - Delete a group through the row delete action, including the confirmation
 *   dialog ("Groep '<naam>' verwijderen"), and see the row disappear.
 * - A group seeded directly through the API shows up in the table after a
 *   page (re)load, proving the list renders server data.
 * - Cleanup: leftover groups created by this spec are removed via the API.
 */
import { test, expect } from "@playwright/test";
import { gotoApp } from "../helpers/app";
import { Api, uniqueName } from "../helpers/api";

type PagedList<T> = { value: T[]; meta: { total: number } };
type GroupRow = { id: string; name?: string };

let api: Api;
/** Names of groups created through the UI (cleaned up by name in afterAll). */
const uiCreatedNames = new Set<string>();
/** Name of the group created in the "add" test, consumed by the "delete" test. */
let addedGroupName: string | undefined;

test.beforeAll(async () => {
  api = await Api.create();
});

test.afterAll(async () => {
  try {
    const groups = await api.get<PagedList<GroupRow>>(
      "/scheduling/v1/groups?pageNumber=1&pageSize=100",
    );
    for (const group of groups.value) {
      if (group.name && uiCreatedNames.has(group.name)) {
        try {
          await api.deleteGroup(group.id);
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

test("add a group via dialog", async ({ page }) => {
  const name = uniqueName("groep");
  uiCreatedNames.add(name);

  await gotoApp(page, "/settings/groups");
  await page.getByRole("button", { name: "Groep toevoegen", exact: true }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Groep toevoegen" })).toBeVisible();
  await dialog.getByLabel("Naam", { exact: true }).fill(name);
  await dialog.getByRole("button", { name: "Toevoegen" }).click();

  await expect(page.getByText("Groep toegevoegd")).toBeVisible();
  await expect(page.getByRole("gridcell", { name, exact: true })).toBeVisible();

  addedGroupName = name;
});

test("delete a group", async ({ page }) => {
  // Normally deletes the group created in the previous test; seeds its own
  // group via the API when running stand-alone (e.g. on a CI retry).
  let name = addedGroupName;
  if (!name) {
    name = uniqueName("groep");
    uiCreatedNames.add(name);
    await api.createGroup(name);
  }

  await gotoApp(page, "/settings/groups");
  const row = page.getByRole("row").filter({ hasText: name });
  await row.getByRole("button", { name: "Verwijder groep" }).click();

  const confirmDialog = page.getByRole("dialog");
  await expect(
    confirmDialog.getByRole("heading", { name: `Groep '${name}' verwijderen` }),
  ).toBeVisible();
  await confirmDialog.getByRole("button", { name: "Verwijderen", exact: true }).click();

  await expect(page.getByText(`Groep '${name}' succesvol verwijderd`)).toBeVisible();
  await expect(page.getByRole("gridcell", { name, exact: true })).toBeHidden();
});

test("a group seeded via the API is listed after reload", async ({ page }) => {
  const name = uniqueName("groep");
  const id = await api.createGroup(name);
  try {
    await gotoApp(page, "/settings/groups");
    await expect(page.getByRole("gridcell", { name, exact: true })).toBeVisible();
  } finally {
    try {
      await api.deleteGroup(id);
    } catch {
      // Best-effort cleanup only.
    }
  }
});
