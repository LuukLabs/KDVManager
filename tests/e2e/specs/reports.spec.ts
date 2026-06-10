/**
 * Use cases covered (task 3 — reporting pages):
 *  UC3.1 Newsletter (/newsletter): generating recipients for the current month lists the
 *        email address of a guardian linked to an active child.
 *  UC3.2 Print schedules (/print-schedules): the filter form renders (month/year/groups
 *        selects) and generating renders the in-page printable pages for the seeded
 *        group, enabling the "Afdrukken" trigger (rendering is in-page, no download).
 *  UC3.3 Print phone list (/print-phone-list): generating renders the phone list table
 *        with the seeded child, guardian and formatted phone number.
 *
 * "Active child" (CRM GetActiveChildrenInPeriodAsync) is driven by activity intervals
 * that CRM receives asynchronously from the Scheduling service after a schedule is
 * created, so beforeAll polls the newsletter-recipients endpoint until the seeded
 * guardian shows up before any UI assertions run.
 */
import { test, expect } from "@playwright/test";
import { gotoApp } from "../helpers/app";
import { Api, uniqueName } from "../helpers/api";

/** Format a Date as local YYYY-MM-DD. */
function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

type NewsletterRecipientsResponse = {
  totalActiveChildren: number;
  recipients: { guardianId: string; fullName: string; email: string }[];
};

const groupName = uniqueName("Groep");
const childGivenName = uniqueName("Kind");
const childFamilyName = "Rapport";
const childFullName = `${childGivenName} ${childFamilyName}`;
const guardianGivenName = uniqueName("Voogd");
const guardianFamilyName = "Rapport";
const guardianFullName = `${guardianGivenName} ${guardianFamilyName}`;
const guardianEmail = `${uniqueName("voogd")}@example.com`;
// "+31612345678" renders as "06-1234 5678" (PrintPhoneListPage formatPhoneNumber).
const guardianPhone = "+31612345678";
const guardianPhoneFormatted = "06-1234 5678";

let api: Api;
let groupId: string;
let timeSlotId: string;
let childId: string;
let guardianId: string;
let scheduleId: string;

test.beforeAll(async () => {
  test.setTimeout(120_000); // seeding waits for cross-service replication

  api = await Api.create();

  groupId = await api.createGroup(groupName);
  timeSlotId = await api.createTimeSlot({
    name: uniqueName("Middag"),
    startTime: "13:00:00",
    endTime: "18:00:00",
  });

  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - 2);
  childId = await api.createChild({
    givenName: childGivenName,
    familyName: childFamilyName,
    dateOfBirth: isoDate(dob),
  });

  guardianId = await api.createGuardian({
    givenName: guardianGivenName,
    familyName: guardianFamilyName,
    dateOfBirth: "1985-05-15",
    email: guardianEmail,
    // PhoneNumberType is a string enum in CRM: Mobile | Home | Work | Other.
    phoneNumbers: [{ number: guardianPhone, type: "Mobile" }],
  });

  // GuardianRelationshipType is a string enum: Parent | Guardian | Grandparent | Other.
  await api.linkGuardianToChild(childId, guardianId, "Parent");

  // Past start date + rules on every weekday => the child is active in the current
  // month/year, which is what the newsletter and phone-list queries filter on.
  scheduleId = await api.createSchedule({
    childId,
    startDate: "2024-01-01",
    scheduleRules: [1, 2, 3, 4, 5].map((day) => ({ day, timeSlotId, groupId })),
  });

  // The child's activity interval reaches CRM asynchronously (RabbitMQ); wait until
  // the newsletter endpoint reports our guardian before running the UI tests.
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const deadline = Date.now() + 60_000;
  for (;;) {
    const response = await api.get<NewsletterRecipientsResponse>(
      `/crm/v1/children/newsletter-recipients?year=${year}&month=${month}`,
    );
    if (response.recipients.some((r) => r.email === guardianEmail)) break;
    if (Date.now() > deadline) {
      throw new Error(
        `Seeded guardian ${guardianEmail} did not appear in newsletter recipients within 60s ` +
          `(child activity interval replication from Scheduling to CRM may have failed).`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
});

test.afterAll(async () => {
  const cleanups: [string, () => Promise<void>][] = [
    ["schedule", () => api.delete(`/scheduling/v1/schedules/${scheduleId}`)],
    ["guardian link", () => api.delete(`/crm/v1/children/${childId}/guardians/${guardianId}`)],
    ["guardian", () => api.deleteGuardian(guardianId)],
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

test.describe("reports", () => {
  test("newsletter lists the guardian email for the current month", async ({ page }) => {
    await gotoApp(page, "/newsletter");

    await expect(page.getByRole("heading", { name: "Nieuwsbrief" })).toBeVisible();
    // Month/year selects default to the current month/year, which is exactly the
    // period our seeded child is active in, so no need to change them.
    await expect(page.getByRole("combobox", { name: "Jaar" })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Maand" })).toBeVisible();

    await page.getByRole("button", { name: "Genereer" }).click();

    await expect(page.getByText(guardianFullName)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(guardianEmail)).toBeVisible();
    // Summary chips render as "<n> actieve kinderen" / "<n> e-mailadressen"
    // (the digit prefix distinguishes them from the page description text).
    await expect(page.getByText(/\d+ actieve kinderen/)).toBeVisible();
    await expect(page.getByText(/\d+ e-mailadressen/)).toBeVisible();
  });

  test("print schedules form renders and generates in-page printable pages", async ({ page }) => {
    await gotoApp(page, "/print-schedules");

    await expect(
      page.getByRole("heading", { name: "Afdrukken aanwezigheidsplanningen" }),
    ).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Maand" })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Jaar" })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Groepen" })).toBeVisible();

    await page.getByRole("button", { name: "Genereer" }).click();

    // The result renders in-page (one A4 "print-page" per group/weekday); the seeded
    // group has scheduled children, so at least one page carries its name as heading.
    await expect(page.getByRole("heading", { name: groupName }).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(childFullName).first()).toBeVisible();
    await expect(page.getByText("Legenda").first()).toBeVisible();

    // The print trigger appears once data is rendered; window.print() opens the native
    // dialog (no download event), so only assert it is enabled.
    await expect(page.getByRole("button", { name: "Afdrukken" })).toBeEnabled();
  });

  test("print phone list shows the guardian phone number", async ({ page }) => {
    await gotoApp(page, "/print-phone-list");

    await expect(page.getByRole("heading", { name: "Telefoonlijst exporteren" })).toBeVisible();
    // Year select defaults to the current year, in which the seeded child is active.
    await expect(page.getByRole("combobox", { name: "Jaar" })).toBeVisible();

    await page.getByRole("button", { name: "Genereer" }).click();

    // In-page table: child, linked guardian (relationship chip "Ouder") and the
    // E.164 number formatted for display.
    await expect(page.getByText(childFullName)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(guardianFullName)).toBeVisible();
    await expect(page.getByText(guardianPhoneFormatted).first()).toBeVisible();
    await expect(page.getByText(/Totaal kinderen/)).toBeVisible();
  });
});
