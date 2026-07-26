/**
 * Use cases covered (task 2 — schedule overview, src/web/src/pages/ScheduleOverviewPage.tsx):
 *  UC2.1 A scheduled child is shown inside its group column on a scheduled day.
 *  UC2.2 Date navigation: next/previous day buttons change the ?date= URL param by one
 *        day; the "Vandaag" button resets it to today.
 *  UC2.3 A closure period states the reason once for the day (page-level alert, fallback
 *        "Gesloten"), keeps the roster visible and suppresses the ratio summary.
 *  UC2.4 An absence is named on the child's own card ("Afgemeld" plus the reason) and
 *        counted in the group's "Dagoverzicht" summary.
 *
 * Seeding goes through the API helpers; schedule rules use .NET System.DayOfWeek
 * (0 = Sunday .. 6 = Saturday) and cover all seven days so any picked date is scheduled.
 */
import { test, expect, type Page, type Locator } from "@playwright/test";
import { gotoApp } from "../helpers/app";
import { Api, uniqueName } from "../helpers/api";
import { expectNoWcagViolations } from "../helpers/a11y";

/** Format a Date as local YYYY-MM-DD (no UTC conversion surprises). */
function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return isoDate(new Date(y, m - 1, d + days));
}

/**
 * Today's YYYY-MM-DD in the browser timezone (Europe/Amsterdam, see
 * playwright.config.ts). Node runs in the runner's timezone (UTC on CI),
 * which is a day behind Amsterdam between 22:00 and midnight UTC.
 */
function todayInAppTimezone(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Amsterdam" }).format(new Date());
}

/** First Wednesday of the current month (a fixed, scheduled weekday). */
function firstWednesdayOfCurrentMonth(): string {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const offset = (3 - first.getDay() + 7) % 7; // 3 = Wednesday
  return isoDate(new Date(now.getFullYear(), now.getMonth(), 1 + offset));
}

/** The group column Paper that contains the group-name heading (GroupColumn.tsx). */
function groupColumn(page: Page, groupName: string): Locator {
  return page
    .locator(".MuiPaper-root")
    .filter({ has: page.getByRole("heading", { name: groupName }) });
}

const groupName = uniqueName("Groep");
const childGivenName = uniqueName("Kind");
const childFamilyName = "Planbord";
const childFullName = `${childGivenName} ${childFamilyName}`;
const closureReason = uniqueName("Studiedag");

const scheduledDate = firstWednesdayOfCurrentMonth();
const absenceDate = addDays(scheduledDate, 7); // another Wednesday
const closureDate = addDays(scheduledDate, 14); // yet another Wednesday

let api: Api;
let groupId: string;
let timeSlotId: string;
let childId: string;
let scheduleId: string;
let closurePeriodId: string;
let absenceId: string;

test.beforeAll(async () => {
  test.setTimeout(120_000); // seeding waits for CRM -> Scheduling replication

  api = await Api.create();

  groupId = await api.createGroup(groupName);
  timeSlotId = await api.createTimeSlot({
    name: uniqueName("Ochtend"),
    startTime: "08:00:00",
    endTime: "13:00:00",
  });

  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - 3); // ~3 years old
  childId = await api.createChild({
    givenName: childGivenName,
    familyName: childFamilyName,
    dateOfBirth: isoDate(dob),
  });

  // All days of the week (System.DayOfWeek: 0 = Sunday .. 6 = Saturday),
  // starting in the past so every date used in these tests is covered.
  scheduleId = await api.createSchedule({
    childId,
    startDate: "2024-01-01",
    scheduleRules: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, timeSlotId, groupId })),
  });

  closurePeriodId = await api.createClosurePeriod({
    startDate: closureDate,
    endDate: closureDate,
    reason: closureReason,
  });

  absenceId = await api.addAbsence({
    childId,
    startDate: absenceDate,
    endDate: absenceDate,
    reason: "Ziek",
  });
});

test.afterAll(async () => {
  // Delete in dependency order; tolerate failures so one leftover doesn't mask the rest.
  const cleanups: [string, () => Promise<void>][] = [
    ["absence", () => api.delete(`/scheduling/v1/absences/${absenceId}`)],
    ["closure period", () => api.deleteClosurePeriod(closurePeriodId)],
    ["schedule", () => api.delete(`/scheduling/v1/schedules/${scheduleId}`)],
    ["child", () => api.deleteChild(childId)],
    ["time slot", () => api.deleteTimeSlot(timeSlotId)],
    ["group", () => api.deleteGroup(groupId)],
  ];
  for (const [what, cleanup] of cleanups) {
    try {
      await cleanup();
    } catch (error) {
      console.warn(`Cleanup of ${what} failed:`, error);
    }
  }
  await api.dispose();
});

test.describe("schedule overview", () => {
  test("shows an accessible scheduled child inside its group column", async ({ page }, testInfo) => {
    await gotoApp(page, `/schedule?date=${scheduledDate}`);

    const column = groupColumn(page, groupName);
    await expect(column.getByRole("heading", { name: groupName })).toBeVisible({
      timeout: 15_000,
    });
    await expect(column.getByText(childFullName)).toBeVisible({ timeout: 15_000 });
    await expectNoWcagViolations(page, testInfo, "schedule-overview-populated");
  });

  test("date navigation updates the date URL param", async ({ page }) => {
    // Start far away from today so next/previous never lands on today
    // (the "Vandaag" button is disabled when today is selected).
    const start = addDays(todayInAppTimezone(), 30);
    await gotoApp(page, `/schedule?date=${start}`);

    // The chevrons used to be located by elimination ("every button in the
    // header that isn't Vandaag"), which broke as soon as the header gained a
    // date picker. They carry explicit testids now.
    const previousDay = page.getByTestId("schedule-previous-day");
    const nextDay = page.getByTestId("schedule-next-day");
    await expect(nextDay).toBeVisible({ timeout: 15_000 });

    await nextDay.click();
    await expect(page).toHaveURL(new RegExp(`[?&]date=${addDays(start, 1)}`));

    await previousDay.click();
    await expect(page).toHaveURL(new RegExp(`[?&]date=${start}`));

    await previousDay.click();
    await expect(page).toHaveURL(new RegExp(`[?&]date=${addDays(start, -1)}`));

    await page.getByRole("button", { name: "Vandaag" }).click();
    await expect(page).toHaveURL(new RegExp(`[?&]date=${todayInAppTimezone()}`));
  });

  test("states a closure once and keeps the roster readable", async ({ page }, testInfo) => {
    await gotoApp(page, `/schedule?date=${closureDate}`);

    // The reason is stated once for the day, in a page-level alert, rather than
    // repeated in a banner per group column.
    const closureAlert = page.getByRole("alert").filter({ hasText: closureReason });
    await expect(closureAlert).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(closureReason)).toHaveCount(1);

    // The roster stays: a closure is exactly when you need to know which
    // parents to phone. It used to be erased, which this asserted.
    const column = groupColumn(page, groupName);
    await expect(column.getByText(childFullName)).toBeVisible();

    // ...and the ratio summary is suppressed, because who is *expected* is moot.
    await expect(column.getByRole("heading", { name: "Dagoverzicht" })).toBeHidden();

    await expectNoWcagViolations(page, testInfo, "schedule-overview-closed");
  });

  test("names an absent child's state on the card, not just by dimming it", async ({
    page,
  }, testInfo) => {
    await gotoApp(page, `/schedule?date=${absenceDate}`);

    const column = groupColumn(page, groupName);
    await expect(column.getByText(childFullName)).toBeVisible({ timeout: 15_000 });

    // The card itself says "Afgemeld" and carries the reason, so the state is
    // legible without comparing opacities, and reaches a screen reader.
    const card = column
      .locator(".MuiCard-root")
      .filter({ has: page.getByText(childFullName) });
    await expect(card.getByText("Afgemeld")).toBeVisible();
    await expect(card.getByText(/Ziek/i)).toBeVisible();

    // The group summary counts it too, now labelled rather than a bare integer.
    const summary = column
      .locator(".MuiCard-root")
      .filter({ has: page.getByRole("heading", { name: "Dagoverzicht" }) });
    await expect(summary.getByText("1 afgemeld")).toBeVisible();

    await expectNoWcagViolations(page, testInfo, "schedule-overview-absent");
  });
});
