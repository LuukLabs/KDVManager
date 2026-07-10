/**
 * Settings hub & EndMark automation settings.
 *
 * Covered use cases:
 * - The settings hub (/settings) shows the four settings cards with their
 *   Dutch titles (Tijdsloten, Groepen, Sluitingsperiodes, Eindmarkering
 *   automatisering) and navigates to the groups and time-slots pages.
 * - The EndMark automation settings form (/settings/endmark-automation) can be
 *   viewed, a value changed and saved, and the saved value persists across a
 *   reload. (The app gives no success snackbar here: success is signalled by
 *   the Save button returning to its disabled/pristine state and the absence
 *   of the error alert.)
 */
import { test, expect } from "@playwright/test";
import { gotoApp } from "../helpers/app";

test.describe("settings hub", () => {
  test("settings hub shows cards and navigates", async ({ page }) => {
    await gotoApp(page, "/settings");

    // Cards are MUI CardActionAreas (buttons); their accessible name contains
    // title + description. Descriptions are unique per card.
    const timeSlotsCard = page.getByRole("button", {
      name: /Beheer tijdsloten voor planning/,
    });
    const groupsCard = page.getByRole("button", { name: /Beheer groepen/ });
    const closurePeriodsCard = page.getByRole("button", {
      name: /Beheer sluitingsperiodes voor planning/,
    });
    const endMarkCard = page.getByRole("button", {
      name: /Configureer automatische eindmarkering voor kinderen/,
    });

    await expect(timeSlotsCard).toBeVisible();
    await expect(groupsCard).toBeVisible();
    await expect(closurePeriodsCard).toBeVisible();
    await expect(endMarkCard).toBeVisible();

    // Exact Dutch card titles.
    await expect(page.getByText("Tijdsloten", { exact: true })).toBeVisible();
    await expect(page.getByText("Groepen", { exact: true })).toBeVisible();
    await expect(page.getByText("Sluitingsperiodes", { exact: true })).toBeVisible();
    await expect(page.getByText("Eindmarkering automatisering", { exact: true })).toBeVisible();

    await groupsCard.click();
    await expect(page).toHaveURL(/\/settings\/groups$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/settings$/);

    await timeSlotsCard.click();
    await expect(page).toHaveURL(/\/settings\/scheduling$/);
  });
});

test.describe("endmark automation settings", () => {
  test("endmark automation settings can be viewed and saved", async ({ page }) => {
    await gotoApp(page, "/settings/endmark-automation");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Instellingen voor eindmarkering automatisering",
      }),
    ).toBeVisible();

    // Form fields (rendered once settings have loaded).
    const yearsField = page.getByLabel("Jaren na de geboorte");
    await expect(yearsField).toBeVisible();
    await expect(page.getByText("Schakel automatische eindmarkering in")).toBeVisible();
    await expect(page.getByLabel("Beschrijving sjabloon")).toBeVisible();

    const saveButton = page.getByRole("button", { name: "Opslaan" });
    // Pristine form: nothing modified yet.
    await expect(saveButton).toBeDisabled();

    // Pick a value that is guaranteed to differ from the current one.
    const currentValue = await yearsField.inputValue();
    const newValue = currentValue === "6" ? "7" : "6";
    await yearsField.fill(newValue);
    await expect(saveButton).toBeEnabled();

    const putResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/scheduling/v1/endmarksettings") &&
        response.request().method() === "PUT",
    );
    await saveButton.click();
    expect((await putResponse).ok()).toBe(true);

    // Success feedback: form returns to pristine state and no error alert.
    await expect(saveButton).toBeDisabled();
    await expect(
      page.getByText("Bijwerken van instellingen mislukt. Probeer het opnieuw."),
    ).toBeHidden();
    await expect(yearsField).toHaveValue(newValue);

    // Reload and verify the value persisted.
    await gotoApp(page, "/settings/endmark-automation");
    await expect(page.getByLabel("Jaren na de geboorte")).toHaveValue(newValue);
  });
});
