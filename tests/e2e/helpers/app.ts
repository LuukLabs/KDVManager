import { expect, type Page } from "@playwright/test";

/**
 * Navigate to an app path, transparently riding through the mock-auth login
 * bounce (/auth/login -> mock authorize -> /auth/callback -> destination).
 * The mock auto-approves, so no credentials are involved.
 */
export async function gotoApp(page: Page, path = "/"): Promise<void> {
  await page.goto(path);
  await page.waitForURL((url) => !url.pathname.startsWith("/auth/"), { timeout: 30_000 });
  // The app shell (top navbar) signals that providers and router are settled.
  await expect(page.getByRole("banner")).toBeVisible({ timeout: 15_000 });
}
