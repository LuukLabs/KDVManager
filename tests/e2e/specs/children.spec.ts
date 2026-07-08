/**
 * Children management (CRM) — e2e specs.
 *
 * Use cases covered:
 * - Children list shows children seeded through the API (MUI DataGrid rows).
 * - The search field filters the list (300ms debounce, server-side search).
 * - Creating a new child via the form (incl. MUI date field) redirects to the
 *   child detail page and shows the child's name.
 * - Editing child details on the detail page (Basic Information card edit
 *   toggle -> change family name -> save -> persisted after reload).
 * - Deleting a child from the list via the row action + confirmation dialog.
 * - The pagination control is present on the list (interacting with paging
 *   would require seeding >10 rows, which is intentionally skipped).
 *
 * All Dutch strings are taken from src/web/src/locales/nl/{translation,common}.json.
 */
import { test, expect, type Page } from "@playwright/test";
import { gotoApp } from "../helpers/app";
import { Api, uniqueName } from "../helpers/api";
import { fillMuiDateField } from "../helpers/datefield";

const DOB = "2022-02-01"; // arbitrary, stable date of birth for seeded children

test.describe("children", () => {
  let api: Api;
  /** Every child created in this file (seeded or via UI) is cleaned up here. */
  const createdChildIds: string[] = [];

  test.beforeAll(async () => {
    api = await Api.create();
  });

  test.afterAll(async () => {
    for (const id of createdChildIds) {
      try {
        await api.deleteChild(id);
      } catch {
        // Already deleted by a test (or never fully created) — ignore.
      }
    }
    await api.dispose();
  });

  async function seedChild(givenName: string, familyName: string): Promise<string> {
    const id = await api.createChild({ givenName, familyName, dateOfBirth: DOB });
    createdChildIds.push(id);
    return id;
  }

  /** DataGrid row containing the given (unique) texts. */
  function row(page: Page, ...texts: string[]) {
    let rows = page.getByRole("row");
    for (const text of texts) {
      rows = rows.filter({ hasText: text });
    }
    return rows;
  }

  test("children list shows seeded children", async ({ page }) => {
    // Both children share one unique family name. The tenant database is
    // shared across runs, so the unscoped first page (size 10) may not contain
    // fresh rows; scoping the list via the supported ?q= URL param keeps the
    // assertion deterministic while still rendering the regular list page.
    const familyName = uniqueName("Lijst");
    await seedChild("Anna", familyName);
    await seedChild("Bram", familyName);

    await gotoApp(page, `/children?q=${familyName}`);

    await expect(row(page, "Anna", familyName)).toBeVisible();
    await expect(row(page, "Bram", familyName)).toBeVisible();
  });

  test("search filters the list", async ({ page }) => {
    const familyA = uniqueName("ZoekA");
    const familyB = uniqueName("ZoekB");
    await seedChild("Saar", familyA);
    await seedChild("Tess", familyB);

    await gotoApp(page, "/children");

    // The search input debounces 300ms before updating ?q=; the web-first
    // assertions below retry until the filtered result is rendered.
    await page.getByPlaceholder("Zoek kinderen…").fill(familyA);

    await expect(row(page, "Saar", familyA)).toBeVisible();
    await expect(row(page, "Tess", familyB)).not.toBeVisible();
  });

  test("create a new child via the form", async ({ page }) => {
    const givenName = "Noor";
    const familyName = uniqueName("Nieuw");

    await gotoApp(page, "/children");
    await page.getByRole("link", { name: "Kind toevoegen" }).click();

    await page.getByLabel("Voornaam").fill(givenName);
    await page.getByLabel("Achternaam").fill(familyName);
    await fillMuiDateField(page.getByRole("group", { name: /Geboortedatum/ }), "01-02-2022");

    await page.getByRole("button", { name: "Opslaan" }).click();

    // Successful creation navigates to /children/<guid>.
    await page.waitForURL(/\/children\/[0-9a-f]{8}-[0-9a-f-]{27}$/i);
    const childId = new URL(page.url()).pathname.split("/").pop()!;
    createdChildIds.push(childId);

    await expect(
      page.getByRole("heading", { name: `${givenName} ${familyName}` }),
    ).toBeVisible();
  });

  test("edit child details", async ({ page }) => {
    const childId = await seedChild("Evi", uniqueName("Voor"));
    const newFamilyName = uniqueName("Bewerkt");

    await gotoApp(page, `/children/${childId}`);

    // The Basic Information card is read-only until its edit toggle (an icon
    // button without aria-label in the card header) is clicked.
    const basicCard = page.locator(".MuiCard-root").filter({ hasText: "Basisinformatie" });
    await basicCard.getByRole("button").first().click();

    await basicCard.getByLabel("Achternaam").fill(newFamilyName);

    // In edit mode the first header button is Save (second is Cancel).
    await basicCard.getByRole("button").first().click();
    await expect(page.getByText("Basisinformatie succesvol bijgewerkt")).toBeVisible();

    // Re-navigate and verify the change persisted.
    await gotoApp(page, `/children/${childId}`);
    await expect(page.getByRole("heading", { name: `Evi ${newFamilyName}` })).toBeVisible();
  });

  test("delete a child from the list", async ({ page }) => {
    const familyName = uniqueName("Weg");
    await seedChild("Wout", familyName);

    await gotoApp(page, `/children?q=${familyName}`);
    const childRow = row(page, "Wout", familyName);
    await expect(childRow).toBeVisible();

    await childRow.getByRole("button", { name: "Verwijder kind" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText(familyName);
    await dialog.getByRole("button", { name: "Verwijderen", exact: true }).click();

    await expect(childRow).not.toBeVisible();
  });

  test("pagination control is present", async ({ page }) => {
    await gotoApp(page, "/children");

    // Interacting with paging reliably would need >10 seeded rows, which is
    // expensive; assert the DataGrid pagination control renders instead.
    await expect(page.locator(".MuiTablePagination-root")).toBeVisible();
  });

  test("shows the error page for a non-existent child", async ({ page }) => {
    // The child loader fetches the child by id; a valid-but-unknown GUID returns
    // 404, which React Router surfaces via the root route's errorElement
    // (ErrorPage). That element sits above MainLayout, so there is no navbar —
    // navigate manually (riding the auth bounce) instead of using gotoApp, which
    // waits for the app banner.
    const missingId = "00000000-0000-0000-0000-000000000000";
    await page.goto(`/children/${missingId}`);
    await page.waitForURL((url) => !url.pathname.startsWith("/auth/"), { timeout: 30_000 });

    // ErrorPage renders its heading and a "home" action regardless of the exact
    // error message.
    await expect(page.getByRole("heading", { name: /Oeps/ })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Ga naar start" })).toBeVisible();
  });
});
