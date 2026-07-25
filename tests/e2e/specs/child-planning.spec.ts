/**
 * Child planning tab (schedules + end marks) — e2e specs.
 *
 * Use cases covered:
 * - The planning tab renders a schedule and an end mark seeded via the API
 *   (schedule card with period/time-slot/group, end-mark card with date/reason).
 * - Adding a schedule through the "Planning toevoegen" dialog (start date plus
 *   one "planningsregel": a tijdslot, a groep and the days they apply to) and
 *   seeing it appear in the tab.
 * - Adding an end mark through the "Eindmarkering toevoegen" dialog.
 * - Deleting a schedule via the schedule card action + confirmation dialog.
 *
 * The schedule overview page itself is covered by schedule-overview.spec.ts,
 * so this file stays focused on the child planning tab UI.
 *
 * All Dutch strings are taken from src/web/src/locales/nl/{translation,common}.json.
 *
 * The planning editor authors a week as a list of planningsregels, where one
 * regel = one tijdslot + one groep + N days, and each ticked day becomes one
 * wire rule on submit. Locator consequences:
 * - every regel is a role=region named "Planningsregel {n}" — the stable
 *   scoping handle for its two comboboxes and its seven day checkboxes;
 * - the Tijdslot/Groep listboxes are portaled OUTSIDE the dialog, so their
 *   options must be located on the page, not inside the dialog;
 * - a day may appear at most once per tijdslot, so the day checkbox of a day
 *   already planned in that tijdslot is natively disabled.
 *
 * Every child also gets a system-generated end mark ("Eindmarkering" + "Auto"
 * chips) as soon as the Scheduling service learns about it (see
 * EndMarkAutomationService.cs). Consequences for these tests:
 * - the timeline is never empty, so the "Geen planningen gevonden" empty state
 *   never renders for our children;
 * - "Eindmarkering" chip assertions must be scoped to the card with our unique
 *   reason text, otherwise they hit the auto card too (strict mode violation).
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { gotoApp } from "../helpers/app";
import { Api, uniqueName } from "../helpers/api";
import { fillMuiDateField } from "../helpers/datefield";

// A Monday in the past so seeded/created schedules are immediately active.
const SCHEDULE_START = "2026-01-05"; // YYYY-MM-DD (API)
const SCHEDULE_START_NL = "05-01-2026"; // DD-MM-YYYY (MUI date field, nl locale)

/** The role=region wrapping one authored planningsregel (1-based). */
const planningsregel = (dialog: Locator, number: number): Locator =>
  dialog.getByRole("region", { name: `Planningsregel ${number}` });

/**
 * Picks a value in one of a planningsregel's two MUI Selects.
 *
 * The combobox lives inside the dialog, but its listbox is rendered in a portal
 * on `document.body`, so the option has to be located on the page.
 */
async function selectInRegel(
  page: Page,
  regel: Locator,
  field: RegExp,
  option: RegExp,
): Promise<void> {
  await regel.getByRole("combobox", { name: field }).click();
  await page.getByRole("option", { name: option }).click();
}

test.describe("child planning tab", () => {
  let api: Api;
  let groupId: string;
  let timeSlotId: string;
  let childAId: string; // gets a seeded schedule + end mark
  let childBId: string; // used for UI-driven creation
  let childCId: string; // used for modal validation flows
  let childDId: string; // used for the multi-day planningsregel
  const groupName = uniqueName("Groep");
  const timeSlotName = uniqueName("Blok");
  const familyA = uniqueName("PlanA");
  const familyB = uniqueName("PlanB");
  const endMarkReason = uniqueName("Reden");

  test.beforeAll(async () => {
    // Seeding waits out CRM -> Scheduling replication for four children.
    test.setTimeout(120_000);

    api = await Api.create();
    groupId = await api.createGroup(groupName);
    timeSlotId = await api.createTimeSlot({
      name: timeSlotName,
      startTime: "08:30:00",
      endTime: "13:00:00",
    });
    childAId = await api.createChild({
      givenName: "Mila",
      familyName: familyA,
      dateOfBirth: "2023-03-10",
    });
    childBId = await api.createChild({
      givenName: "Lars",
      familyName: familyB,
      dateOfBirth: "2023-04-20",
    });
    childCId = await api.createChild({
      givenName: "Noor",
      familyName: uniqueName("Validatie"),
      dateOfBirth: "2023-05-20",
    });
    childDId = await api.createChild({
      givenName: "Sem",
      familyName: uniqueName("Dagdelen"),
      dateOfBirth: "2023-06-20",
    });

    // The Scheduling service learns about new children asynchronously from CRM
    // (RabbitMQ). api.createSchedule retries internally until replication has
    // settled, so after these calls both children are known to Scheduling.
    // Child A keeps its schedule (rendered + deleted in the tests below).
    await api.createSchedule({
      childId: childAId,
      startDate: SCHEDULE_START,
      scheduleRules: [{ day: 1 /* Monday */, timeSlotId, groupId }],
    });
    await api.createEndMark({
      childId: childAId,
      endDate: "2030-06-30",
      reason: endMarkReason,
    });

    // Child B gets a throwaway schedule purely to wait out replication, so the
    // UI-driven submit in "add a schedule via the dialog" cannot race it.
    const dummyScheduleId = await api.createSchedule({
      childId: childBId,
      startDate: SCHEDULE_START,
      scheduleRules: [{ day: 2 /* Tuesday */, timeSlotId, groupId }],
    });
    await api.delete(`/scheduling/v1/schedules/${dummyScheduleId}`);

    const validationDummyScheduleId = await api.createSchedule({
      childId: childCId,
      startDate: SCHEDULE_START,
      scheduleRules: [{ day: 2 /* Tuesday */, timeSlotId, groupId }],
    });
    await api.delete(`/scheduling/v1/schedules/${validationDummyScheduleId}`);

    const dagdelenDummyScheduleId = await api.createSchedule({
      childId: childDId,
      startDate: SCHEDULE_START,
      scheduleRules: [{ day: 2 /* Tuesday */, timeSlotId, groupId }],
    });
    await api.delete(`/scheduling/v1/schedules/${dagdelenDummyScheduleId}`);
  });

  test.afterAll(async () => {
    const attempt = async (fn: () => Promise<unknown>) => {
      try {
        await fn();
      } catch {
        // Best-effort cleanup — ignore failures (e.g. already deleted).
      }
    };

    for (const childId of [childAId, childBId, childCId, childDId]) {
      if (!childId) continue;
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

  test("planning tab shows a seeded schedule and end mark", async ({
    page,
  }) => {
    await gotoApp(page, `/children/${childAId}/planning`);

    await expect(
      page.getByRole("heading", { name: "Huidige planning" }),
    ).toBeVisible();

    // Schedule card: period title, time-slot chip (HH:mm-HH:mm) and group name.
    await expect(page.getByText("Planningsperiode")).toBeVisible();
    await expect(page.getByText("08:30-13:00")).toBeVisible();
    await expect(page.getByText(groupName)).toBeVisible();

    // End-mark card: chip, date (rendered as YYYY-MM-DD) and reason. Scoped to
    // the seeded card because the auto-generated end mark renders the same chip.
    const endMarkCard = page
      .locator(".MuiCard-root")
      .filter({ hasText: endMarkReason });
    await expect(
      endMarkCard.getByText("Eindmarkering", { exact: true }),
    ).toBeVisible();
    await expect(endMarkCard.getByText("2030-06-30")).toBeVisible();
  });

  test("add a schedule via the dialog", async ({ page }) => {
    await gotoApp(page, `/children/${childBId}/planning`);

    // The auto-generated end mark means the timeline is never empty, so assert
    // the precondition as "no schedule card yet" instead of the empty state.
    await expect(
      page.getByRole("heading", { name: "Huidige planning" }),
    ).toBeVisible();
    await expect(page.getByText("Planningsperiode")).toHaveCount(0);
    await page.getByRole("button", { name: "Planning toevoegen" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await fillMuiDateField(
      dialog.getByRole("group", { name: /Startdatum/ }),
      SCHEDULE_START_NL,
    );

    // The dialog opens on one empty planningsregel — no "toevoegen" click is
    // needed to start. Pick the tijdslot and the groep once, then tick the days.
    const regel = planningsregel(dialog, 1);
    await selectInRegel(page, regel, /Tijdslot/, new RegExp(timeSlotName));
    await selectInRegel(page, regel, /Groep/, new RegExp(groupName));
    await regel.getByRole("checkbox", { name: "Maandag" }).check();

    await dialog.getByRole("button", { name: /Planning aanmaken/ }).click();

    await expect(page.getByText("Planning succesvol toegevoegd")).toBeVisible();
    await expect(dialog).not.toBeVisible();

    // The new schedule renders in the timeline.
    await expect(page.getByText("Planningsperiode")).toBeVisible();
    await expect(page.getByText("08:30-13:00")).toBeVisible();
    await expect(page.getByText(groupName)).toBeVisible();
  });

  test("requires a start date before a complete planningsregel can be saved", async ({
    page,
  }) => {
    await gotoApp(page, `/children/${childCId}/planning`);
    await page.getByRole("button", { name: "Planning toevoegen" }).click();

    const dialog = page.getByRole("dialog");
    const regel = planningsregel(dialog, 1);
    await selectInRegel(page, regel, /Tijdslot/, new RegExp(timeSlotName));
    await selectInRegel(page, regel, /Groep/, new RegExp(groupName));
    await regel.getByRole("checkbox", { name: "Maandag" }).check();

    // The status region names the one thing still missing.
    await expect(dialog.getByText("Nog nodig: een startdatum")).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: /Planning aanmaken/ }),
    ).toBeDisabled();
    await dialog.getByRole("button", { name: "Annuleren" }).click();
  });

  test("plans three days in one planningsregel", async ({ page }) => {
    await gotoApp(page, `/children/${childDId}/planning`);
    await expect(page.getByText("Planningsperiode")).toHaveCount(0);
    await page.getByRole("button", { name: "Planning toevoegen" }).click();

    const dialog = page.getByRole("dialog");
    await fillMuiDateField(
      dialog.getByRole("group", { name: /Startdatum/ }),
      SCHEDULE_START_NL,
    );

    const regel = planningsregel(dialog, 1);
    await selectInRegel(page, regel, /Tijdslot/, new RegExp(timeSlotName));
    await selectInRegel(page, regel, /Groep/, new RegExp(groupName));
    for (const day of ["Maandag", "Dinsdag", "Donderdag"]) {
      await regel.getByRole("checkbox", { name: day }).check();
    }

    // The recap counts dagdelen (one per ticked day), never authored regels.
    await expect(dialog.getByText("3 dagdelen")).toBeVisible();
    await dialog.getByRole("button", { name: /Planning aanmaken/ }).click();

    await expect(page.getByText("Planning succesvol toegevoegd")).toBeVisible();
    await expect(dialog).not.toBeVisible();

    // One planningsregel over three days is three rules on the wire, so the
    // week grid on the card shows the tijdslot on three days.
    const scheduleCard = page
      .locator(".MuiCard-root")
      .filter({ hasText: "Planningsperiode" });
    await expect(scheduleCard.getByText("08:30-13:00")).toHaveCount(3);
    await expect(scheduleCard.getByText(groupName)).toHaveCount(3);
  });

  test("blocks a day that is already planned in the same tijdslot", async ({
    page,
  }) => {
    await gotoApp(page, `/children/${childCId}/planning`);
    await page.getByRole("button", { name: "Planning toevoegen" }).click();

    const dialog = page.getByRole("dialog");
    const first = planningsregel(dialog, 1);
    await selectInRegel(page, first, /Tijdslot/, new RegExp(timeSlotName));
    await selectInRegel(page, first, /Groep/, new RegExp(groupName));
    await first.getByRole("checkbox", { name: "Maandag" }).check();

    await dialog
      .getByRole("button", { name: "Planningsregel toevoegen" })
      .click();
    const second = planningsregel(dialog, 2);
    await expect(second).toBeVisible();
    await selectInRegel(page, second, /Tijdslot/, new RegExp(timeSlotName));

    // A day may appear at most once per tijdslot, so the duplicate is
    // unreachable rather than rejected by the server, and the reason is
    // persistent visible text.
    await expect(
      second.getByRole("checkbox", { name: "Maandag" }),
    ).toBeDisabled();
    await expect(second.getByText("Al ingepland in")).toBeVisible();
    await expect(
      second.getByRole("checkbox", { name: "Dinsdag" }),
    ).toBeEnabled();
    // The first planningsregel never blocks its own day.
    await expect(
      first.getByRole("checkbox", { name: "Maandag" }),
    ).toBeEnabled();

    await dialog.getByRole("button", { name: "Annuleren" }).click();
  });

  test("replaces the draft with the active planning, after confirming", async ({
    page,
  }) => {
    await gotoApp(page, `/children/${childAId}/planning`);
    await page.getByRole("button", { name: "Planning toevoegen" }).click();

    const dialog = page.getByRole("dialog");
    const copyButton = dialog.getByRole("button", {
      name: "Huidige planning kopiëren",
    });
    // Always enabled: there is no dirty-draft guard any more.
    await expect(copyButton).toBeEnabled();
    await copyButton.click();

    // An empty draft is replaced straight away.
    const regel = planningsregel(dialog, 1);
    await expect(regel).toContainText(timeSlotName);
    await expect(dialog.getByText("Huidige planning gekopieerd")).toBeVisible();
    // Copying a weekly pattern never guesses an effective date.
    await expect(dialog.getByText("Nog nodig: een startdatum")).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: /Planning aanmaken/ }),
    ).toBeDisabled();

    // A non-empty draft is replaced too, but only after confirming.
    await copyButton.click();
    const confirmQuestion = "Je concept vervangen door de huidige planning?";
    // While the panel is open there are TWO "Annuleren" buttons (the panel's and
    // the dialog footer's), so scope to the innermost Paper carrying the
    // question.
    const confirmPanel = dialog
      .locator(".MuiPaper-root")
      .filter({ hasText: confirmQuestion })
      .last();
    await expect(confirmPanel).toBeVisible();
    await confirmPanel.getByRole("button", { name: "Annuleren" }).click();
    await expect(dialog.getByText(confirmQuestion)).toBeHidden();

    await copyButton.click();
    await dialog.getByRole("button", { name: "Concept vervangen" }).click();
    await expect(dialog.getByText(confirmQuestion)).toBeHidden();
    await expect(regel).toContainText(timeSlotName);
    // Still exactly one planningsregel: a replace never appends.
    await expect(
      dialog.getByRole("region", { name: /^Planningsregel / }),
    ).toHaveCount(1);
    await expect(
      dialog.getByRole("button", { name: /Planning aanmaken/ }),
    ).toBeDisabled();

    await dialog.getByRole("button", { name: "Annuleren" }).click();
  });

  test("treats Sunday as a complete planningsregel and blocks an incomplete second one", async ({
    page,
  }) => {
    await gotoApp(page, `/children/${childCId}/planning`);
    await page.getByRole("button", { name: "Planning toevoegen" }).click();

    const dialog = page.getByRole("dialog");
    await fillMuiDateField(
      dialog.getByRole("group", { name: /Startdatum/ }),
      SCHEDULE_START_NL,
    );

    const first = planningsregel(dialog, 1);
    await selectInRegel(page, first, /Tijdslot/, new RegExp(timeSlotName));
    await selectInRegel(page, first, /Groep/, new RegExp(groupName));
    // Sunday is day 0 and must count as a real day, not as "nothing selected".
    await first.getByRole("checkbox", { name: "Zondag" }).check();
    await expect(
      dialog.getByRole("button", { name: /Planning aanmaken/ }),
    ).toBeEnabled();

    // A second, still-empty planningsregel re-closes the gate and says why.
    await dialog
      .getByRole("button", { name: "Planningsregel toevoegen" })
      .click();
    await expect(planningsregel(dialog, 2)).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: /Planning aanmaken/ }),
    ).toBeDisabled();
    await expect(
      dialog.getByText("een tijdslot in planningsregel 2"),
    ).toBeVisible();
    await dialog.getByRole("button", { name: "Annuleren" }).click();
  });

  test("shows a form-level backend validation error and allows a corrected retry", async ({
    page,
  }) => {
    // The day-per-tijdslot invariant makes the server's duplicate-triple error
    // unreachable through the UI, so the only way to keep the FormErrorAlert
    // path (and its Dutch message) covered is to fail the first POST from the
    // route. The second POST falls through to the real API.
    let failNext = true;
    await page.route("**/scheduling/v1/schedules", async (route) => {
      if (route.request().method() !== "POST" || !failNext) {
        return route.fallback();
      }
      failNext = false;
      await route.fulfill({
        status: 422,
        // The API is a different origin than the app, so a fulfilled response
        // needs its own CORS header or the browser rejects it before the app
        // ever sees the body.
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
        },
        body: JSON.stringify({
          status: 422,
          errors: [
            {
              property: "ScheduleRules",
              code: "ContainNoDuplicateRules",
              title:
                "A schedule cannot contain the same day, time slot and group more than once.",
            },
          ],
        }),
      });
    });

    await gotoApp(page, `/children/${childCId}/planning`);
    await page.getByRole("button", { name: "Planning toevoegen" }).click();

    const dialog = page.getByRole("dialog");
    await fillMuiDateField(
      dialog.getByRole("group", { name: /Startdatum/ }),
      SCHEDULE_START_NL,
    );

    const regel = planningsregel(dialog, 1);
    await selectInRegel(page, regel, /Tijdslot/, new RegExp(timeSlotName));
    await selectInRegel(page, regel, /Groep/, new RegExp(groupName));
    await regel.getByRole("checkbox", { name: "Maandag" }).check();

    await dialog.getByRole("button", { name: /Planning aanmaken/ }).click();

    // Exactly one role="alert" in the dialog: the FormErrorAlert.
    const alert = dialog.getByRole("alert");
    await expect(alert).toContainText(
      "Dezelfde combinatie van dag, tijdslot en groep mag maar één keer in een planning voorkomen.",
    );
    await expect(alert).toBeInViewport();

    // The form stays filled and resubmittable.
    await dialog.getByRole("button", { name: /Planning aanmaken/ }).click();

    await expect(page.getByText("Planning succesvol toegevoegd")).toBeVisible();
    await expect(dialog).not.toBeVisible();
  });

  test("add an end mark via the dialog", async ({ page }) => {
    await gotoApp(page, `/children/${childBId}/planning`);

    // Same dialog pattern as "Afwezigheid toevoegen": a modal with a date
    // field and an optional reason field.
    await page.getByRole("button", { name: "Eindmarkering toevoegen" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await fillMuiDateField(
      dialog.getByRole("group", { name: /Einddatum/ }),
      "15-01-2031",
    );
    await dialog.getByLabel(/Reden/).fill(`${endMarkReason}-ui`);
    await dialog.getByRole("button", { name: "Toevoegen" }).click();

    await expect(page.getByText("Eindmarkering toegevoegd")).toBeVisible();
    await expect(dialog).not.toBeVisible();

    // Scope to the new card — the auto-generated end mark shows the same chip.
    const newEndMarkCard = page
      .locator(".MuiCard-root")
      .filter({ hasText: `${endMarkReason}-ui` });
    await expect(
      newEndMarkCard.getByText("Eindmarkering", { exact: true }),
    ).toBeVisible();
    await expect(newEndMarkCard.getByText("2031-01-15")).toBeVisible();
  });

  test("delete a schedule via the card action", async ({ page }) => {
    await gotoApp(page, `/children/${childAId}/planning`);

    await expect(page.getByText("Planningsperiode")).toBeVisible();
    await page.getByRole("button", { name: "Verwijder Planning" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("Verwijder Planning");
    await dialog
      .getByRole("button", { name: "Verwijderen", exact: true })
      .click();

    await expect(
      page.getByText("Planning is succesvol verwijderd"),
    ).toBeVisible();
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
