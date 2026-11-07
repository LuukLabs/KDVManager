import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { useForm } from "react-hook-form";
import { ThemeProvider } from "@mui/material/styles";
import i18n from "i18next";

import { Form } from "@components/forms";
import { theme } from "@lib/theme";
import type { DayOfWeek } from "@api/scheduling/models/dayOfWeek";
import enTranslation from "../../locales/en/translation.json";
import { renderWithProviders } from "../../test/renderWithProviders";
import { DayCheckboxGroup } from "./DayCheckboxGroup";
import type { ScheduleFormValues } from "./scheduleBlocks";

/**
 * The seven day checkboxes of one planningsregel.
 *
 * Driven through the real DOM: the point of this file is the native checkbox
 * semantics (Space toggles, Tab moves, disabled means disabled) and the
 * accessible names, none of which survive a shallow render.
 */

// The shipped English catalog rather than the empty test catalog, so the
// accessible names asserted here are the ones the app really exposes — and a
// deleted key fails the test instead of silently rendering as its own name.
beforeAll(() => {
  i18n.addResourceBundle("en", "translation", enTranslation, true, true);
});

/** [accessible name, visible abbreviation], in the rendered Monday-first order. */
const DAY_LABELS: [long: string, short: string][] = [
  ["Monday", "Mon"],
  ["Tuesday", "Tue"],
  ["Wednesday", "Wed"],
  ["Thursday", "Thu"],
  ["Friday", "Fri"],
  ["Saturday", "Sat"],
  ["Sunday", "Sun"],
];

const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const WEEKEND_NAMES = ["Saturday", "Sunday"];

const ID_PREFIX = "test-block";

type HarnessProps = {
  days?: DayOfWeek[];
  blockedDays?: DayOfWeek[];
  blockedReason?: string | null;
  removalNote?: string | null;
  disabled?: boolean;
};

const Harness = ({
  days = [],
  blockedDays = [],
  blockedReason = null,
  removalNote = null,
  disabled = false,
}: HarnessProps) => {
  const formContext = useForm<ScheduleFormValues>({
    // Same mode as the dialog, so the validate rule reports on change.
    mode: "onChange",
    defaultValues: {
      startDate: "",
      blocks: [{ id: "block-1", timeSlotId: "slot-1", groupId: "group-1", days }],
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Form formContext={formContext}>
        <DayCheckboxGroup
          name="blocks.0.days"
          blockedDays={new Set(blockedDays)}
          blockedReason={blockedReason}
          removalNote={removalNote}
          disabled={disabled}
          idPrefix={ID_PREFIX}
        />
      </Form>
    </ThemeProvider>
  );
};

const dayCheckbox = (name: string) => page.getByRole("checkbox", { name });

describe("DayCheckboxGroup", () => {
  beforeEach(async () => {
    await page.viewport(1280, 800);
  });

  it("renders seven unchecked day checkboxes in a fieldset named Days", async () => {
    await renderWithProviders(<Harness />);

    const fieldset = page.getByRole("group", { name: "Days" });
    await expect.element(fieldset).toBeVisible();

    for (const [long, short] of DAY_LABELS) {
      await expect.element(dayCheckbox(long)).not.toBeChecked();
      // WCAG 2.5.3: the visible abbreviation is a prefix of the accessible name.
      await expect.element(fieldset).toHaveTextContent(short);
      expect(long.startsWith(short)).toBe(true);
    }

    await expect.element(page.getByText("0 days selected")).toBeVisible();
  });

  it("ticks exactly Monday to Friday and nothing else, idempotently", async () => {
    await renderWithProviders(<Harness />);

    const monToFri = page.getByRole("button", { name: "Select Monday to Friday" });
    // The aria-label wins over the visible "Mon to Fri" text.
    await expect.element(monToFri).toHaveTextContent("Mon to Fri");

    await userEvent.click(monToFri);

    for (const name of WEEKDAY_NAMES) {
      await expect.element(dayCheckbox(name)).toBeChecked();
    }
    for (const name of WEEKEND_NAMES) {
      await expect.element(dayCheckbox(name)).not.toBeChecked();
    }
    await expect.element(page.getByText("5 days selected")).toBeVisible();

    // Add-only: pressing it a second time changes nothing.
    await userEvent.click(monToFri);

    for (const name of WEEKDAY_NAMES) {
      await expect.element(dayCheckbox(name)).toBeChecked();
    }
    for (const name of WEEKEND_NAMES) {
      await expect.element(dayCheckbox(name)).not.toBeChecked();
    }
    await expect.element(page.getByText("5 days selected")).toBeVisible();
  });

  it("never selects a blocked day through the Mon-to-Fri shortcut", async () => {
    await renderWithProviders(<Harness blockedDays={[3]} blockedReason="Already planned" />);

    await userEvent.click(page.getByRole("button", { name: "Select Monday to Friday" }));

    for (const name of ["Monday", "Tuesday", "Thursday", "Friday"]) {
      await expect.element(dayCheckbox(name)).toBeChecked();
    }
    await expect.element(dayCheckbox("Wednesday")).not.toBeChecked();
    await expect.element(page.getByText("4 days selected")).toBeVisible();
  });

  it("toggles with Space, keeps focus, and ignores arrow keys", async () => {
    await renderWithProviders(<Harness />);

    const monday = dayCheckbox("Monday");
    await userEvent.click(monday);
    await expect.element(monday).toBeChecked();

    // Focus stayed on the control that was just used (the whole subtree used to
    // remount on every value change, which sent focus back to BODY).
    expect(document.activeElement).toBe(monday.element());

    await userEvent.keyboard(" ");
    await expect.element(monday).not.toBeChecked();

    await userEvent.keyboard(" ");
    await expect.element(monday).toBeChecked();

    // No roving tabindex, no custom key handling: arrows must not move the
    // selection the way they would inside a radiogroup.
    await userEvent.keyboard("{ArrowRight}{ArrowDown}");
    await expect.element(monday).toBeChecked();
    for (const name of ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]) {
      await expect.element(dayCheckbox(name)).not.toBeChecked();
    }
  });

  it("gives every day its own tab stop, in Monday-first order", async () => {
    await renderWithProviders(<Harness />);

    (dayCheckbox("Monday").element() as HTMLElement).focus();

    for (const [long] of DAY_LABELS.slice(1)) {
      await userEvent.tab();
      expect(document.activeElement).toBe(dayCheckbox(long).element());
    }

    // Tab leaves the fieldset for the "Mon t/m vr" shortcut instead of cycling.
    await userEvent.tab();
    expect(document.activeElement).toBe(
      page.getByRole("button", { name: "Select Monday to Friday" }).element(),
    );
  });

  it("keeps accessible names identical on desktop and mobile", async () => {
    await renderWithProviders(<Harness />);

    for (const [width, height] of [
      [1280, 800],
      [375, 667],
    ]) {
      await page.viewport(width!, height!);
      for (const [long, short] of DAY_LABELS) {
        // The native input is opacity:0 by MUI design, so assert presence
        // rather than visibility — the accessible name is what matters here.
        await expect.element(dayCheckbox(long)).toBeInTheDocument();
        await expect.element(page.getByRole("group", { name: "Days" })).toHaveTextContent(short);
      }
    }
  });

  it("disables an already-planned day and names the reason in its description", async () => {
    const reason = "Already planned in Ochtend: Mon";
    await renderWithProviders(<Harness blockedDays={[1]} blockedReason={reason} />);

    const monday = dayCheckbox("Monday");
    await expect.element(monday).toBeDisabled();
    // The reason is persistent visible text, not a tooltip, and it is wired
    // into the checkbox's description chain.
    await expect.element(page.getByText(reason)).toBeVisible();
    expect(monday.element().getAttribute("aria-describedby")).toContain(`${ID_PREFIX}-days-reason`);

    await expect.element(dayCheckbox("Tuesday")).toBeEnabled();
    expect(dayCheckbox("Tuesday").element().getAttribute("aria-describedby")).toBeNull();
  });

  it("reports the empty selection inline once the last day is removed", async () => {
    await renderWithProviders(<Harness days={[1]} />);

    const monday = dayCheckbox("Monday");
    await expect.element(monday).toBeChecked();

    await userEvent.click(monday);

    await expect.element(page.getByText("Select at least one day")).toBeVisible();
    expect(monday.element().getAttribute("aria-describedby")).toContain(`${ID_PREFIX}-days-helper`);
  });

  it("disables every day while the form is submitting", async () => {
    await renderWithProviders(<Harness disabled />);

    for (const [long] of DAY_LABELS) {
      await expect.element(dayCheckbox(long)).toBeDisabled();
    }
    await expect
      .element(page.getByRole("button", { name: "Select Monday to Friday" }))
      .toBeDisabled();
  });
});
