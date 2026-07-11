/**
 * Child planning tab — extra flows not covered by child-planning.spec.ts.
 *
 * Use cases covered:
 * - Editing an existing schedule via the schedule card's edit action (change
 *   the start date, save) → "Planning succesvol bijgewerkt" snackbar. The edit
 *   dialog atomically replaces the existing schedule (EditChildScheduleDialog),
 *   so this exercises the update path end-to-end.
 * - Adding an absence through the "Afwezigheid toevoegen" dialog (AddAbsenceDialog)
 *   and seeing it listed (AbsenceList, default "Toekomst" view).
 * - Deleting an absence via the row delete action + confirmation dialog
 *   (DeleteAbsenceButton → shared IconDeleteButton / createDeleteTexts).
 *
 * These are the child-planning gaps the e2e catalog flagged (absence UI was
 * only seeded via API and asserted on the schedule overview; schedule editing
 * was untested). All Dutch strings come from src/web/src/locales/nl/.
 *
 * Like child-planning.spec.ts, the seeded child gets a system end mark from the
 * EndMark automation as soon as Scheduling learns about it, so absence/schedule
 * assertions are scoped to our unique text rather than asserting empty states.
 */
import { test, expect } from "@playwright/test";
import { gotoApp } from "../helpers/app";
import { Api, uniqueName } from "../helpers/api";
import { fillMuiDateField } from "../helpers/datefield";

// A Monday in the past so the seeded schedule is immediately active.
const SCHEDULE_START = "2026-01-05"; // YYYY-MM-DD (API)
const SCHEDULE_START_EDITED_NL = "12-01-2026"; // DD-MM-YYYY (MUI date field, nl)
// A far-future absence so it always lands in the default "Toekomst" (future) view.
const SEEDED_ABSENCE_DATE = "2030-05-10";

test.describe("child planning tab — extras", () => {
  let api: Api;
  let groupId: string;
  let timeSlotId: string;
  let childId: string;
  const groupName = uniqueName("Groep");
  const timeSlotName = uniqueName("Blok");
  const familyName = uniqueName("Extra");
  // Absence ids created directly through the API, cleaned up in afterAll.
  const seededAbsenceIds: string[] = [];

  test.beforeAll(async () => {
    test.setTimeout(120_000); // seeding waits for CRM -> Scheduling replication

    api = await Api.create();
    groupId = await api.createGroup(groupName);
    timeSlotId = await api.createTimeSlot({
      name: timeSlotName,
      startTime: "08:30:00",
      endTime: "13:00:00",
    });
    childId = await api.createChild({
      givenName: "Fien",
      familyName,
      dateOfBirth: "2023-03-10",
    });

    // createSchedule retries until CRM -> Scheduling replication has settled, so
    // after this the child is known to Scheduling (needed for the absence flows
    // too) and a schedule exists for the edit test.
    await api.createSchedule({
      childId,
      startDate: SCHEDULE_START,
      scheduleRules: [{ day: 1 /* Monday */, timeSlotId, groupId }],
    });
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
      // Schedules and end marks first (dependency order), then the child.
      await attempt(async () => {
        const schedules = await api.get<{ id?: string }[]>(
          `/scheduling/v1/schedules?childId=${childId}`,
        );
        for (const schedule of schedules) {
          if (schedule.id)
            await attempt(() =>
              api.delete(`/scheduling/v1/schedules/${schedule.id}`),
            );
        }
      });
      await attempt(async () => {
        const absences = await api.get<{ id?: string }[]>(
          `/scheduling/v1/children/${childId}/absences`,
        );
        for (const absence of absences) {
          if (absence.id)
            await attempt(() =>
              api.delete(`/scheduling/v1/absences/${absence.id}`),
            );
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
    // Any absence we seeded but whose row-delete test did not remove.
    for (const id of seededAbsenceIds) {
      await attempt(() => api.delete(`/scheduling/v1/absences/${id}`));
    }
    if (timeSlotId) await attempt(() => api.deleteTimeSlot(timeSlotId));
    if (groupId) await attempt(() => api.deleteGroup(groupId));
    await api.dispose();
  });

  test("edit a schedule via the card action", async ({ page }) => {
    await gotoApp(page, `/children/${childId}/planning`);

    // The schedule card renders the period title; scope the edit action to it
    // (the auto end-mark card has no edit button, but scoping keeps it robust).
    const scheduleCard = page
      .locator(".MuiCard-root")
      .filter({ hasText: "Planningsperiode" });
    await expect(scheduleCard).toBeVisible();

    // The edit IconButton's accessible name comes from its tooltip ("Bewerk
    // planning"); MUI icon data-testids are stripped in the production build.
    await scheduleCard.getByRole("button", { name: "Bewerk planning" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Bewerk planning")).toBeVisible();

    // The existing rule is pre-filled and complete, so only the start date is
    // changed; the submit button stays enabled (1/1 rules complete).
    await fillMuiDateField(
      dialog.getByRole("group", { name: /Startdatum/ }),
      SCHEDULE_START_EDITED_NL,
    );
    await dialog.getByRole("button", { name: /Planning bijwerken/ }).click();

    await expect(page.getByText("Planning succesvol bijgewerkt")).toBeVisible();
    await expect(dialog).not.toBeVisible();
    // The updated schedule still renders with its time slot and group.
    await expect(page.getByText("Planningsperiode")).toBeVisible();
    await expect(page.getByText("08:30-13:00")).toBeVisible();
    await expect(page.getByText(groupName)).toBeVisible();
  });

  test("add an absence via the dialog", async ({ page }) => {
    const reason = uniqueName("Vakantie");

    await gotoApp(page, `/children/${childId}/planning`);
    await page.getByRole("button", { name: "Afwezigheid toevoegen" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Afwezigheid toevoegen")).toBeVisible();

    // Start date defaults to today (a future/"Toekomst" entry); only the reason
    // needs filling, which also makes the form dirty so "Toevoegen" enables.
    await dialog.getByLabel("Reden").fill(reason);
    await dialog.getByRole("button", { name: "Toevoegen" }).click();

    await expect(page.getByText("Afwezigheid toegevoegd")).toBeVisible();
    await expect(dialog).not.toBeVisible();
    // The new absence shows in the (default) future-absences list.
    await expect(page.getByText(reason)).toBeVisible();
  });

  test("delete an absence via the row action", async ({ page }) => {
    const reason = uniqueName("Ziek");
    // Seed a future absence directly (the child is already known to Scheduling).
    const absenceId = await api.addAbsence({
      childId,
      startDate: SEEDED_ABSENCE_DATE,
      endDate: SEEDED_ABSENCE_DATE,
      reason,
    });
    seededAbsenceIds.push(absenceId);

    await gotoApp(page, `/children/${childId}/planning`);

    // Scope to the absence card carrying our unique reason (other absences may
    // be present from the add test). Several nested Papers contain the reason
    // (the section wrapper and the row); .last() is the innermost — the row.
    const absenceRow = page
      .locator(".MuiPaper-root")
      .filter({ hasText: reason })
      .last();
    await expect(absenceRow).toBeVisible();
    await absenceRow
      .getByRole("button", { name: "Verwijder afwezigheid" })
      .click();

    const confirmDialog = page.getByRole("dialog");
    await expect(
      confirmDialog.getByText("Verwijder afwezigheid"),
    ).toBeVisible();
    await confirmDialog
      .getByRole("button", { name: "Verwijderen", exact: true })
      .click();

    await expect(
      page.getByText("Afwezigheid is succesvol verwijderd"),
    ).toBeVisible();
    await expect(page.getByText(reason)).toBeHidden();
  });
});
