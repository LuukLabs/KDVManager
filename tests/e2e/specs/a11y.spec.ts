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
import { Api, uniqueName } from "../helpers/api";
import { expectNoWcagViolations, writeA11yReport } from "../helpers/a11y";

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
  // Emit one consolidated axe HTML report after all scans (runs even on failure).
  test.afterAll(() => {
    const reportPath = writeA11yReport();
    if (reportPath) console.log(`Accessibility report written: tests/e2e/${reportPath}`);
  });

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

  // The planning editor is the app's densest form (selects, a checkbox
  // fieldset, live region, categorical colours), so it gets its own scan. It
  // needs seeded data: without a time slot and a group the dialog renders the
  // setup panel instead of the planningsregels.
  test.describe("add-planning dialog", () => {
    let api: Api;
    let groupId: string;
    let timeSlotId: string;
    let childId: string;

    test.beforeAll(async () => {
      test.setTimeout(120_000); // seeding waits for CRM -> Scheduling replication

      api = await Api.create();
      groupId = await api.createGroup(uniqueName("A11yGroep"));
      timeSlotId = await api.createTimeSlot({
        name: uniqueName("A11yTijdslot"),
        startTime: "08:30:00",
        endTime: "13:00:00",
      });
      childId = await api.createChild({
        givenName: "Axe",
        familyName: uniqueName("Scan"),
        dateOfBirth: "2023-03-10",
      });

      // createSchedule retries until CRM -> Scheduling replication has settled;
      // it is deleted again so the dialog opens on an empty draft.
      const scheduleId = await api.createSchedule({
        childId,
        startDate: "2026-01-05",
        scheduleRules: [{ day: 1 /* Monday */, timeSlotId, groupId }],
      });
      await api.delete(`/scheduling/v1/schedules/${scheduleId}`);
    });

    test.afterAll(async () => {
      const attempt = async (fn: () => Promise<unknown>) => {
        try {
          await fn();
        } catch {
          // Best-effort cleanup — ignore failures (e.g. already deleted).
        }
      };

      if (childId) {
        // Schedules and end marks first (dependency order), then the child. The
        // end-mark automation adds one as soon as Scheduling learns of the child.
        await attempt(async () => {
          const schedules = await api.get<{ id?: string }[]>(
            `/scheduling/v1/schedules?childId=${childId}`,
          );
          for (const schedule of schedules) {
            if (schedule.id)
              await attempt(() => api.delete(`/scheduling/v1/schedules/${schedule.id}`));
          }
        });
        await attempt(async () => {
          const endMarks = await api.get<{ id?: string }[]>(
            `/scheduling/v1/endmarks?childId=${childId}`,
          );
          for (const endMark of endMarks) {
            if (endMark.id) await attempt(() => api.deleteEndMark(endMark.id!));
          }
        });
        await attempt(() => api.deleteChild(childId));
      }
      if (timeSlotId) await attempt(() => api.deleteTimeSlot(timeSlotId));
      if (groupId) await attempt(() => api.deleteGroup(groupId));
      await api.dispose();
    });

    test("no serious/critical violations with the add-planning dialog open", async ({
      page,
    }, testInfo) => {
      await gotoApp(page, `/children/${childId}/planning`);
      await page.getByRole("button", { name: "Planning toevoegen" }).click();
      await page.getByRole("dialog").waitFor();
      await expectNoWcagViolations(page, testInfo, "child-planning-add-dialog");
    });
  });
});
