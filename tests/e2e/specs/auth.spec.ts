/**
 * Use cases covered (task 1 — auth flow):
 *  UC1.1 Unauthenticated visit to "/" rides the login bounce and lands on /schedule.
 *  UC1.2 A deep link (/children) is preserved through the login bounce.
 *  UC1.3 Logging out via the account menu redirects to the (mock) Auth0 logout endpoint.
 *
 * Notes on the flow (see src/web/src/lib/auth/auth.ts and pages/auth/*):
 *  - Protected routes redirect to /auth/login?returnTo=<path>, which bounces through the
 *    auto-approving mock IdP and /auth/callback back to the original destination.
 *  - AccountMenu calls auth0-react logout() without returnTo, so the browser ends up on
 *    the mock IdP's /v2/logout page, which renders the plain text "Logged out"
 *    (tests/e2e/mock-auth/server.mjs).
 */
import { test, expect } from "@playwright/test";
import { gotoApp } from "../helpers/app";

test.describe("authentication", () => {
  test("unauthenticated visit goes through login flow and lands on the schedule page", async ({
    page,
  }) => {
    // Raw navigation on purpose: we want to observe the auth bounce ourselves.
    await page.goto("/");

    // "/" redirects to /schedule, which bounces through /auth/login -> mock -> /auth/callback.
    await page.waitForURL((url) => url.pathname === "/schedule", { timeout: 30_000 });

    await expect(page).toHaveURL(/\/schedule/);
    // Main UI is visible: app navbar and the schedule overview page title ("Planningsoverzicht").
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Planningsoverzicht" })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("deep link is preserved through the login bounce", async ({ page }) => {
    await page.goto("/children");

    // The returnTo query param carries /children through the bounce (LoginPage/CallbackPage).
    await page.waitForURL((url) => url.pathname === "/children", { timeout: 30_000 });

    await expect(page).toHaveURL(/\/children/);
    await expect(page.getByRole("banner")).toBeVisible();
  });

  test("user can log out", async ({ page }) => {
    await gotoApp(page, "/schedule");

    // The account menu trigger is the avatar IconButton in the navbar (AccountMenu.tsx).
    // It has no stable accessible name (avatar fallback letter), so locate it as the
    // only visible navbar button containing an avatar.
    const accountButton = page
      .getByRole("banner")
      .locator("button")
      .filter({ has: page.locator(".MuiAvatar-root") });
    await accountButton.click();

    await page.getByRole("menuitem", { name: "Uitloggen" }).click();

    // auth0-react logout() without returnTo: we end up on the mock IdP logout endpoint,
    // which responds with the plain text "Logged out".
    await page.waitForURL(/\/v2\/logout/, { timeout: 30_000 });
    await expect(page.getByText("Logged out")).toBeVisible();
  });
});
