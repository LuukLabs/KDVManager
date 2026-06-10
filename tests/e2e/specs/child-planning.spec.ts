/**
 * Child planning tab (schedules + end marks) — e2e specs.
 *
 * Use cases covered:
 * - The planning tab renders a schedule and an end mark seeded via the API
 *   (schedule card with period/time-slot/group, end-mark card with date/reason).
 * - Adding a schedule through the "Planning toevoegen" dialog (start date,
 *   rule with day + time slot + group) and seeing it appear in the tab.
 * - Adding an end mark through the inline "Eindmarkering toevoegen" form.
 * - Deleting a schedule via the schedule card action + confirmation dialog.
 *
 * The schedule overview page itself is covered by schedule-overview.spec.ts,
 * so this file stays focused on the child planning tab UI.
 *
 * All Dutch strings are taken from src/web/src/locales/nl/{translation,common}.json.
 * Note: the weekday buttons in the add-schedule dialog show untranslated short
 * names ("Mon", "Tue", ...) on desktop — see AddChildScheduleDialog_v2.tsx.
 *
 * Every child also gets a system-generated end mark ("Eindmarkering" + "Auto"
 * chips) as soon as the Scheduling service learns about it (see
 * EndMarkAutomationService.cs). Consequences for these tests:
 * - the timeline is never empty, so the "Geen planningen gevonden" empty state
 *   never renders for our children;
 * - "Eindmarkering" chip assertions must be scoped to the card with our unique
 *   reason text, otherwise they hit the auto card too (strict mode violation).
 */
import { test, expect } from "@playwright/test";
import { gotoApp } from "../helpers/app";
import { Api, uniqueName } from "../helpers/api";
import { fillMuiDateField } from "../helpers/datefield";

// A Monday in the past so seeded/created schedules are immediately active.
const SCHEDULE_START = "2026-01-05"; // YYYY-MM-DD (API)
const SCHEDULE_START_NL = "05-01-2026"; // DD-MM-YYYY (MUI date field, nl locale)

test.describe("child planning tab", () => {
  let api: Api;
  let groupId: string;
  let timeSlotId: string;
  let childAId: string; // gets a seeded schedule + end mark
  let childBId: string; // used for UI-driven creation
  const groupName = uniqueName("Groep");
  const timeSlotName = uniqueName("Blok");
  const familyA = uniqueName("PlanA");
  const familyB = uniqueName("PlanB");
  const endMarkReason = uniqueName("Reden");

  test.beforeAll(async () => {
    api = await Api.create();
    groupId = await api.createGroup(groupName);
    timeSlotId = await api.createTimeSlot({
      name: timeSlotName,
      startTime: "08:30:00",
      endTime: "13:00:00",
    });
    childAId = await api.createChild({ givenName: "Mila", familyName: familyA, dateOfBirth: "2023-03-10" });
    childBId = await api.createChild({ givenName: "Lars", familyName: familyB, dateOfBirth: "2023-04-20" });

    // The Scheduling service learns about new children asynchronously from CRM
    // (RabbitMQ). api.createSchedule retries internally until replication has
    // settled, so after these calls both children are known to Scheduling.
    // Child A keeps its schedule (rendered + deleted in the tests below).
    await api.createSchedule({
      childId: childAId,
      startDate: SCHEDULE_START,
      scheduleRules: [{ day: 1 /* Monday */, timeSlotId, groupId }],
    });
    await api.createEndMark({ childId: childAId, endDate: "2030-06-30", reason: endMarkReason });

    // Child B gets a throwaway schedule purely to wait out replication, so the
    // UI-driven submit in "add a schedule via the dialog" cannot race it.
    const dummyScheduleId = await api.createSchedule({
      childId: childBId,
      startDate: SCHEDULE_START,
      scheduleRules: [{ day: 2 /* Tuesday */, timeSlotId, groupId }],
    });
    await api.delete(`/scheduling/v1/schedules/${dummyScheduleId}`);
  });

  test.afterAll(async () => {
    const attempt = async (fn: () => Promise<unknown>) => {
      try {
        await fn();
      } catch {
        // Best-effort cleanup — ignore failures (e.g. already deleted).
      }
    };

    for (const childId of [childAId, childBId]) {
      if (!childId) continue;
      // Schedules and end marks first (dependency order), then the child.
      await attempt(async () => {
        const schedules = await api.get<{ id?: string }[]>(
          `/scheduling/v1/schedules?childId=${childId}`,
        );
        for (const schedule of schedules) {
          if (schedule.id) await attempt(() => api.delete(`/scheduling/v1/schedules/${schedule.id}`));
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

  test("planning tab shows a seeded schedule and end mark", async ({ page }) => {
    await gotoApp(page, `/children/${childAId}/planning`);

    await expect(page.getByRole("heading", { name: "Huidige planning" })).toBeVisible();

    // Schedule card: period title, time-slot chip (HH:mm-HH:mm) and group name.
    await expect(page.getByText("Planningsperiode")).toBeVisible();
    await expect(page.getByText("08:30-13:00")).toBeVisible();
    await expect(page.getByText(groupName)).toBeVisible();

    // End-mark card: chip, date (rendered as YYYY-MM-DD) and reason. Scoped to
    // the seeded card because the auto-generated end mark renders the same chip.
    const endMarkCard = page.locator(".MuiCard-root").filter({ hasText: endMarkReason });
    await expect(endMarkCard.getByText("Eindmarkering", { exact: true })).toBeVisible();
    await expect(endMarkCard.getByText("2030-06-30")).toBeVisible();
  });

  test("add a schedule via the dialog", async ({ page }) => {
    await gotoApp(page, `/children/${childBId}/planning`);

    // The auto-generated end mark means the timeline is never empty, so assert
    // the precondition as "no schedule card yet" instead of the empty state.
    await expect(page.getByRole("heading", { name: "Huidige planning" })).toBeVisible();
    await expect(page.getByText("Planningsperiode")).toHaveCount(0);
    await page.getByRole("button", { name: "Planning toevoegen" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await fillMuiDateField(dialog.getByRole("group", { name: /Startdatum/ }), SCHEDULE_START_NL);

    // Add a rule; the new rule opens in edit mode with day / time slot / group
    // selectors (desktop weekday buttons show short English names).
    await dialog.getByRole("button", { name: "Regel toevoegen" }).click();
    await dialog.getByRole("button").filter({ hasText: /Mon/ }).click();
    await dialog.getByRole("button").filter({ hasText: timeSlotName }).click();
    await dialog.getByRole("button").filter({ hasText: groupName }).click();
    await dialog.getByRole("button", { name: "Gereed" }).click();

    // Submit label reads "Planning aanmaken (1/1)".
    await dialog.getByRole("button", { name: /Planning aanmaken/ }).click();

    await expect(page.getByText("Planning succesvol toegevoegd")).toBeVisible();
    await expect(dialog).not.toBeVisible();

    // The new schedule renders in the timeline.
    await expect(page.getByText("Planningsperiode")).toBeVisible();
    await expect(page.getByText("08:30-13:00")).toBeVisible();
    await expect(page.getByText(groupName)).toBeVisible();
  });

  test("add an end mark via the inline form", async ({ page }) => {
    await gotoApp(page, `/children/${childBId}/planning`);

    // Toggle the inline form open (the toggle then reads "Annuleren", so the
    // submit button below is the only "Eindmarkering toevoegen" left).
    await page.getByRole("button", { name: "Eindmarkering toevoegen" }).click();

    // Native <input type="date"> — fill takes the ISO value.
    await page.getByLabel("Einddatum").fill("2031-01-15");
    await page.getByLabel("Reden").fill(`${endMarkReason}-ui`);
    await page.getByRole("button", { name: "Eindmarkering toevoegen" }).click();

    // Scope to the new card — the auto-generated end mark shows the same chip.
    const newEndMarkCard = page
      .locator(".MuiCard-root")
      .filter({ hasText: `${endMarkReason}-ui` });
    await expect(newEndMarkCard.getByText("Eindmarkering", { exact: true })).toBeVisible();
    await expect(newEndMarkCard.getByText("2031-01-15")).toBeVisible();
  });

  test("delete a schedule via the card action", async ({ page }) => {
    await gotoApp(page, `/children/${childAId}/planning`);

    await expect(page.getByText("Planningsperiode")).toBeVisible();
    await page.getByRole("button", { name: "Verwijder Planning" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("Verwijder Planning");
    await dialog.getByRole("button", { name: "Verwijderen", exact: true }).click();

    await expect(page.getByText("Planning is succesvol verwijderd")).toBeVisible();
    await expect(page.getByText("Planningsperiode")).not.toBeVisible();
    // The seeded end mark is untouched and remains on the timeline (scoped to
    // its card — the auto-generated end mark shows the same chip).
    await expect(
      page
        .locator(".MuiCard-root")
        .filter({ hasText: endMarkReason })
        .getByText("Eindmarkering", { exact: true }),
    ).toBeVisible();
  });
});
