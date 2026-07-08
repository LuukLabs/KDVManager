/**
 * E2E specs for guardian management (CRM).
 *
 * Covered use cases:
 * 1. Guardians list shows seeded guardians; searching by a unique family name
 *    filters the DataGrid (debounced search field + filter chip).
 * 2. Create a guardian via the "Nieuwe voogd toevoegen" form. The form
 *    navigates to the new guardian's DETAIL page after saving (consistent with
 *    the children form), so the new guardian is verified through its heading.
 * 3. Edit guardian basic details on the detail page via the edit-in-place
 *    "Basisinformatie" card, then verify persistence after a reload.
 * 4. Link a child to a guardian. NOTE: link UI was removed from the guardian
 *    detail page (see GuardianDetailPage / GuardianChildrenCard), so linking is
 *    done from the CHILD detail page ("Voogd koppelen" dialog) and the result is
 *    verified in the guardian's linked-children card.
 * 5. Unlink a child on the guardian detail page (unlink icon + confirm dialog).
 * 6. Delete a guardian from the list page row action with confirmation dialog.
 *
 * All data is seeded with uniqueName() and cleaned up in afterAll (try/catch
 * per entity), so this file is independent of other specs.
 */

import { test, expect, type Page, type Locator } from "@playwright/test";
import { Api, uniqueName } from "../helpers/api";
import { gotoApp } from "../helpers/app";

type GuardianListItem = { id: string; fullName: string };

type SeededGuardian = {
  id: string;
  givenName: string;
  familyName: string;
  fullName: string;
};

let api: Api;

const guardianIds: string[] = [];
const childIds: string[] = [];
const links: { childId: string; guardianId: string }[] = [];
// Family names of guardians created through the UI; resolved to ids in afterAll.
const uiCreatedGuardianFamilyNames: string[] = [];

test.beforeAll(async () => {
  api = await Api.create();
});

test.afterAll(async () => {
  // Resolve guardians created via the UI to ids so they can be deleted too.
  for (const familyName of uiCreatedGuardianFamilyNames) {
    try {
      const found = await api.get<GuardianListItem[]>(
        `/crm/v1/guardians?pageNumber=1&pageSize=20&search=${encodeURIComponent(familyName)}`,
      );
      guardianIds.push(...found.map((guardian) => guardian.id));
    } catch {
      // Ignore lookup failures during cleanup.
    }
  }
  // Remove child-guardian links first; guardians with relationships cannot be deleted.
  for (const link of links) {
    try {
      await api.delete(`/crm/v1/children/${link.childId}/guardians/${link.guardianId}`);
    } catch {
      // Already unlinked (e.g. by the unlink test) or never linked.
    }
  }
  for (const id of childIds) {
    try {
      await api.deleteChild(id);
    } catch {
      // Already deleted.
    }
  }
  for (const id of guardianIds) {
    try {
      await api.deleteGuardian(id);
    } catch {
      // Already deleted (e.g. by the delete test).
    }
  }
  await api.dispose();
});

/**
 * Seed a guardian via the API. Given names get an "Aaa" prefix so the seeded
 * guardians sort to the first DataGrid page (the list is ordered by given name).
 */
async function seedGuardian(): Promise<SeededGuardian> {
  const givenName = uniqueName("Aaa");
  const familyName = uniqueName("Testvoogd");
  const id = await api.createGuardian({
    givenName,
    familyName,
    dateOfBirth: "1985-04-12",
    email: `${uniqueName("voogd")}@example.com`,
  });
  guardianIds.push(id);
  return { id, givenName, familyName, fullName: `${givenName} ${familyName}` };
}

async function seedChild(): Promise<{ id: string; fullName: string }> {
  const givenName = uniqueName("Kind");
  const familyName = uniqueName("Kindfam");
  const id = await api.createChild({ givenName, familyName, dateOfBirth: "2022-05-10" });
  childIds.push(id);
  return { id, fullName: `${givenName} ${familyName}` };
}

/** DataGrid row containing the given text (header row never matches a full name). */
const gridRow = (page: Page, text: string): Locator =>
  page.getByRole("row").filter({ hasText: text });

/** Guardians list search field (placeholder "Zoek voogden…", matched as substring). */
const searchField = (page: Page): Locator => page.getByPlaceholder("Zoek voogden");

/** MUI card on a detail page, identified by its title text. */
const cardByTitle = (page: Page, title: string): Locator =>
  page.locator(".MuiCard-root").filter({ hasText: title });

test("guardians list shows seeded guardians + search", async ({ page }) => {
  const guardianA = await seedGuardian();
  const guardianB = await seedGuardian();

  await gotoApp(page, "/guardians");
  await expect(page.getByRole("heading", { name: "Voogden" })).toBeVisible();

  // Both seeded guardians are on the first page ("Aaa…" given names sort first).
  await expect(gridRow(page, guardianA.fullName)).toBeVisible();
  await expect(gridRow(page, guardianB.fullName)).toBeVisible();

  // Search by guardian A's unique family name (input is debounced 300ms).
  await searchField(page).fill(guardianA.familyName);
  await expect(page.getByText(`Filter: ${guardianA.familyName}`)).toBeVisible();
  await expect(gridRow(page, guardianA.fullName)).toBeVisible();
  await expect(gridRow(page, guardianB.fullName)).toHaveCount(0);
});

test("create a guardian via the form", async ({ page }) => {
  const givenName = uniqueName("Aaa");
  const familyName = uniqueName("Nieuwvoogd");
  // Track for cleanup before anything can fail.
  uiCreatedGuardianFamilyNames.push(familyName);

  await gotoApp(page, "/guardians");
  await page.getByRole("link", { name: "Voogd toevoegen" }).click();
  await expect(page).toHaveURL(/\/guardians\/new$/);
  await expect(page.getByRole("heading", { name: "Nieuwe voogd toevoegen" })).toBeVisible();

  // Date of birth and phone numbers are optional and left empty.
  await page.getByLabel("Voornaam").fill(givenName);
  await page.getByLabel("Achternaam").fill(familyName);
  // Email is optional but pattern-validated; fill a valid one.
  await page.getByLabel("E-mail").fill(`${uniqueName("mail")}@example.com`);

  await page.getByRole("button", { name: "Voogd aanmaken" }).click();

  // Successful creation navigates to the new guardian's detail page. Cleanup
  // is handled by the family-name lookup in afterAll (registered pre-submit).
  await page.waitForURL(/\/guardians\/[0-9a-f]{8}-[0-9a-f-]{27}$/i);
  await expect(page.getByRole("heading", { name: `${givenName} ${familyName}` })).toBeVisible();
});

test("create a guardian with a phone number", async ({ page }) => {
  const givenName = uniqueName("Aaa");
  const familyName = uniqueName("Telefoonvoogd");
  uiCreatedGuardianFamilyNames.push(familyName);
  // E.164 number; the detail contact card renders it verbatim.
  const phone = "+31612345678";

  await gotoApp(page, "/guardians");
  await page.getByRole("link", { name: "Voogd toevoegen" }).click();
  await expect(page.getByRole("heading", { name: "Nieuwe voogd toevoegen" })).toBeVisible();

  await page.getByLabel("Voornaam").fill(givenName);
  await page.getByLabel("Achternaam").fill(familyName);
  await page.getByLabel("E-mail").fill(`${uniqueName("mail")}@example.com`);

  // The phone list starts empty; "Telefoon toevoegen" adds a row (type defaults
  // to Mobile), then the E.164 number goes in the "Telefoonnummer" field.
  await page.getByRole("button", { name: "Telefoon toevoegen" }).click();
  // exact match: the remove-phone button's aria-label ("Telefoonnummer
  // verwijderen") also contains "Telefoonnummer" and would otherwise match.
  await page.getByLabel("Telefoonnummer", { exact: true }).fill(phone);

  await page.getByRole("button", { name: "Voogd aanmaken" }).click();

  await page.waitForURL(/\/guardians\/[0-9a-f]{8}-[0-9a-f-]{27}$/i);
  await expect(page.getByRole("heading", { name: `${givenName} ${familyName}` })).toBeVisible();
  // The contact-information card shows the saved phone number.
  await expect(page.getByText(phone)).toBeVisible();
});

test("edit guardian details", async ({ page }) => {
  const guardian = await seedGuardian();
  const newGivenName = uniqueName("Aab");

  await gotoApp(page, `/guardians/${guardian.id}`);
  await expect(page.getByRole("heading", { name: guardian.fullName })).toBeVisible();

  // Enter edit mode on the "Basisinformatie" card. The toggle is an icon-only
  // button without aria-label or tooltip (MUI strips icon data-testids in
  // production builds), but it is the card's ONLY button in view mode.
  const basicCard = cardByTitle(page, "Basisinformatie");
  await basicCard.getByRole("button").click();

  await basicCard.getByLabel("Voornaam").fill(newGivenName);
  // In edit mode the card header renders Save then Cancel (icon-only, both
  // unlabeled); the date picker's "choose date" button follows in the content.
  // Save is therefore the first button in DOM order.
  await basicCard.getByRole("button").first().click();

  // Success snackbar confirms the update went through.
  await expect(page.getByText("Basisinformatie succesvol bijgewerkt")).toBeVisible();

  // Verify persistence with a hard reload.
  await page.reload();
  await expect(
    page.getByRole("heading", { name: `${newGivenName} ${guardian.familyName}` }),
  ).toBeVisible();
});

test("link a child to a guardian", async ({ page }) => {
  const guardian = await seedGuardian();
  const child = await seedChild();
  // Track the (future) link for cleanup before driving the UI.
  links.push({ childId: child.id, guardianId: guardian.id });

  // Linking lives on the child detail page; the guardian detail page only
  // displays linked children.
  await gotoApp(page, `/children/${child.id}`);
  await page.getByRole("button", { name: "Voogd koppelen" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Bestaande voogd koppelen")).toBeVisible();

  // Search (minimum 2 characters) and select the guardian from the results.
  await dialog.getByPlaceholder("Zoek op naam...").fill(guardian.familyName);
  await dialog.getByText(guardian.fullName).click();
  await expect(dialog.getByText("Geselecteerd:")).toBeVisible();

  // Pick the relationship type; options are the untranslated enum keys
  // (Parent / Guardian / Grandparent / Other). "exact" avoids matching
  // "Grandparent" by substring.
  await dialog.getByRole("combobox").click();
  await page.getByRole("option", { name: "Guardian", exact: true }).click();

  await dialog.getByRole("button", { name: "Voogd koppelen" }).click();
  await expect(dialog).toBeHidden();

  // The guardian appears in the child's guardian list with the translated
  // relationship chip ("Guardian" -> "Verzorger"). Exact match avoids matching
  // the "Verzorger gekoppeld" success snackbar shown right after linking.
  await expect(page.getByText(guardian.fullName)).toBeVisible();
  await expect(page.getByText("Verzorger", { exact: true })).toBeVisible();

  // And the child appears in the guardian's linked-children card.
  await gotoApp(page, `/guardians/${guardian.id}`);
  await expect(cardByTitle(page, "Kinderen").getByText(child.fullName)).toBeVisible();
});

test("unlink child from guardian", async ({ page }) => {
  const guardian = await seedGuardian();
  const child = await seedChild();
  await api.linkGuardianToChild(child.id, guardian.id, "Parent");
  links.push({ childId: child.id, guardianId: guardian.id });

  await gotoApp(page, `/guardians/${guardian.id}`);
  await expect(page.getByText(child.fullName)).toBeVisible();

  // Unlink icon button has aria-label "Ontkoppelen" (common.unlink); exact match
  // avoids the clickable row wrapper, whose accessible name also contains it.
  await page.getByRole("button", { name: "Ontkoppelen", exact: true }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Kind ontkoppelen")).toBeVisible();
  await dialog.getByRole("button", { name: "Ontkoppelen", exact: true }).click();

  // Wait for the dialog to close first: its confirmation text also contains the
  // child's full name, which would otherwise trip strict mode (two matches).
  await expect(dialog).toBeHidden();
  await expect(cardByTitle(page, "Kinderen").getByText(child.fullName)).toBeHidden();
  await expect(page.getByText("Geen kinderen gekoppeld aan deze voogd")).toBeVisible();
});

test("delete a guardian", async ({ page }) => {
  const guardian = await seedGuardian();

  await gotoApp(page, "/guardians");
  await searchField(page).fill(guardian.familyName);
  // The filter chip confirms the search made it into the URL (?q=...).
  await expect(page.getByText(`Filter: ${guardian.familyName}`)).toBeVisible();

  const row = gridRow(page, guardian.fullName);
  await expect(row).toBeVisible();

  // Row delete action is an icon-only button; its Tooltip ("Verwijder voogd")
  // doubles as the accessible name. (Icon data-testids such as DeleteIcon are
  // stripped from MUI production builds, so they cannot be used here.)
  await row.getByRole("button", { name: "Verwijder voogd" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Verwijder voogd")).toBeVisible();
  // Exact match: "Verwijderen" (confirm), not "Annuleren" / "Verwijderen...".
  await dialog.getByRole("button", { name: "Verwijderen", exact: true }).click();
  await expect(dialog.getByText("is succesvol verwijderd")).toBeVisible();

  // The grid's react-query cache is invalidated with a non-matching key, so
  // reload instead (the search term is preserved in the URL) and assert the
  // row is gone.
  await page.reload();
  await expect(searchField(page)).toHaveValue(guardian.familyName);
  await expect(gridRow(page, guardian.fullName)).toHaveCount(0);
});
