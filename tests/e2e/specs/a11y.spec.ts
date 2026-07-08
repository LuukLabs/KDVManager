/**
 * WCAG 2.1 A/AA accessibility scans (axe-core) across the app's routes.
 *
 * Each test loads a page (riding the mock-auth bounce via gotoApp), lets it
 * settle, and runs an axe scan. The scan fails on serious/critical violations
 * and attaches the full findings (all impact levels) to the report — see
 * helpers/a11y.ts for the gating rationale.
 *
 * Automated scans cover only part of WCAG. They catch contrast, missing
 * accessible names, ARIA misuse, landmark/heading structure and form labels;
 * they do NOT judge logical focus order, keyboard operability, meaningful
 * sequence, or screen-reader announcements — those still need manual review.
 *
 * These scans use empty/near-empty pages on purpose: they exercise the app
 * shell, list scaffolding and forms without depending on seeded data, which
 * keeps them fast and low-flake. Data-rich and dynamic states (populated grids,
 * detail pages) can be layered on later.
 */
import { test } from "@playwright/test";
import { gotoApp } from "../helpers/app";
import { expectNoWcagViolations } from "../helpers/a11y";

/** Top-level routes that render under MainLayout (all require auth). */
const ROUTES: { path: string; label: string }[] = [
  { path: "/schedule", label: "schedule-overview" },
  { path: "/children", label: "children-list" },
  { path: "/children/new", label: "children-new" },
  { path: "/guardians", label: "guardians-list" },
  { path: "/guardians/new", label: "guardians-new" },
  { path: "/newsletter", label: "newsletter" },
  { path: "/print-schedules", label: "print-schedules" },
  { path: "/print-phone-list", label: "print-phone-list" },
  { path: "/settings", label: "settings-hub" },
  { path: "/settings/scheduling", label: "settings-timeslots" },
  { path: "/settings/groups", label: "settings-groups" },
  { path: "/settings/closure-periods", label: "settings-closure-periods" },
  { path: "/settings/endmark-automation", label: "settings-endmark" },
];

test.describe("accessibility (WCAG 2.1 A/AA)", () => {
  for (const { path, label } of ROUTES) {
    test(`no serious/critical violations on ${path}`, async ({ page }, testInfo) => {
      await gotoApp(page, path);
      // Let data-driven content render before scanning; networkidle is
      // best-effort (some pages keep a connection open), so don't hard-fail.
      await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
      await expectNoWcagViolations(page, testInfo, label);
    });
  }

  test("no serious/critical violations with the add-group dialog open", async ({
    page,
  }, testInfo) => {
    // Modal dialogs are a common a11y weak spot (dialog role, labelling, focus).
    await gotoApp(page, "/settings/groups");
    await page.getByRole("button", { name: "Groep toevoegen", exact: true }).click();
    await page.getByRole("dialog").waitFor();
    await expectNoWcagViolations(page, testInfo, "settings-groups-add-dialog");
  });
});
