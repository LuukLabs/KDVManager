import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { ThemeProvider } from "@mui/material/styles";
import NiceModal from "@ebay/nice-modal-react";
import i18n from "i18next";

import { theme } from "@lib/theme";
import type { ChildScheduleListVMScheduleRule } from "@api/scheduling/models/childScheduleListVMScheduleRule";
import enTranslation from "../../locales/en/translation.json";
import { renderWithProviders } from "../../test/renderWithProviders";

/**
 * The planning editor, driven through the real DOM.
 *
 * These tests are the ones the old dialog never had: they assert the wire
 * payload (one command, one rule per ticked day), the day-per-time-slot
 * invariant as the user experiences it, inline validation instead of
 * snackbars, the lookup setup panels, the edit-mode pre-fill and diff, and
 * that focus survives a selection.
 */

// ----- Mocks --------------------------------------------------------------

const CHILD_ID = "11111111-1111-1111-1111-111111111111";
const SCHEDULE_ID = "22222222-2222-2222-2222-222222222222";

/** Two non-overlapping slots, so no overlap warning muddies the status line. */
const SLOT_MORNING = {
  id: "slot-morning",
  name: "Ochtend",
  startTime: "08:00:00",
  endTime: "13:00:00",
};
const SLOT_AFTERNOON = {
  id: "slot-afternoon",
  name: "Middag",
  startTime: "13:00:00",
  endTime: "18:00:00",
};
const GROUP_STARS = { id: "group-stars", name: "Sterretjes" };
const GROUP_SUNS = { id: "group-suns", name: "Zonnetjes" };

const mocks = vi.hoisted(() => ({
  addSchedule: vi.fn(),
  updateSchedule: vi.fn(),
  enqueueSnackbar: vi.fn(),
  refetchTimeSlots: vi.fn(),
  refetchGroups: vi.fn(),
  // Mutated per test BEFORE rendering; the arrays keep a stable identity for
  // the whole test so the dialog's useMemo lookups do not churn.
  timeSlots: { data: [] as unknown[], isPending: false, isError: false },
  groups: { data: [] as unknown[], isPending: false, isError: false },
  childSchedules: { data: [] as unknown[] },
}));

vi.mock("@api/scheduling/endpoints/time-slots/time-slots", () => ({
  useListTimeSlots: () => ({ ...mocks.timeSlots, refetch: mocks.refetchTimeSlots }),
}));

vi.mock("@api/scheduling/endpoints/groups/groups", () => ({
  useListGroups: () => ({ ...mocks.groups, refetch: mocks.refetchGroups }),
}));

vi.mock("@api/scheduling/endpoints/schedules/schedules", () => ({
  useAddSchedule: () => ({ mutateAsync: mocks.addSchedule }),
  useGetChildSchedules: () => ({ data: mocks.childSchedules.data }),
  getGetChildSchedulesQueryKey: (params?: unknown) => ["getChildSchedules", params],
  getGetSchedulesByDateQueryKey: (params?: unknown) => ["getSchedulesByDate", params],
}));

vi.mock("./useUpdateSchedule", () => ({
  useUpdateSchedule: () => ({ mutateAsync: mocks.updateSchedule }),
}));

vi.mock("@api/crm/endpoints/children/children", () => ({
  useGetChildById: () => ({ data: { givenName: "Lars", familyName: "Jansen" } }),
}));

// Real SnackbarProvider (renderWithProviders mounts it), spied hook: the
// "validation never snackbars" assertion needs the call count, not the toast.
vi.mock("notistack", async () => {
  const actual = await vi.importActual<typeof import("notistack")>("notistack");
  return {
    ...actual,
    useSnackbar: () => ({ enqueueSnackbar: mocks.enqueueSnackbar, closeSnackbar: vi.fn() }),
  };
});

// ----- Harness ------------------------------------------------------------

beforeAll(() => {
  // Ship-real English catalog, so every name asserted below is a name the app
  // actually exposes and a deleted key fails loudly.
  i18n.addResourceBundle("en", "translation", enTranslation, true, true);
});

const importAddDialog = async () =>
  (await import("./AddChildScheduleDialog_v2")).AddChildScheduleDialogV2;
const importEditDialog = async () =>
  (await import("./EditChildScheduleDialog")).EditChildScheduleDialog;

const MODAL_ID = "child-schedule-dialog-under-test";

const dialog = () => page.getByRole("dialog");
const region = (number: number) => dialog().getByRole("region", { name: `Block ${number}` });
const submitButton = (name: RegExp) => dialog().getByRole("button", { name });

const openAddDialog = async () => {
  const AddChildScheduleDialogV2 = await importAddDialog();
  await renderWithProviders(
    <ThemeProvider theme={theme}>
      <NiceModal.Provider>
        <AddChildScheduleDialogV2 id={MODAL_ID} defaultVisible childId={CHILD_ID} />
      </NiceModal.Provider>
    </ThemeProvider>,
  );
  await expect.element(dialog()).toBeVisible();
};

const openEditDialog = async (scheduleRules: ChildScheduleListVMScheduleRule[]) => {
  const EditChildScheduleDialog = await importEditDialog();
  await renderWithProviders(
    <ThemeProvider theme={theme}>
      <NiceModal.Provider>
        <EditChildScheduleDialog
          id={MODAL_ID}
          defaultVisible
          childId={CHILD_ID}
          schedule={{ id: SCHEDULE_ID, startDate: "2026-09-01", scheduleRules }}
        />
      </NiceModal.Provider>
    </ThemeProvider>,
  );
  await expect.element(dialog()).toBeVisible();
};

/**
 * Fills the MUI X date field section by section, the way
 * tests/e2e/helpers/datefield.ts does. The test LocalizationProvider runs the
 * "en" locale, so the sections are Month / Day / Year.
 */
const fillStartDate = async (isoDate: string) => {
  const [year, month, day] = isoDate.split("-");
  const field = dialog().getByRole("group", { name: /Start Date/ });
  await userEvent.fill(field.getByRole("spinbutton", { name: "Month" }), month!);
  await userEvent.fill(field.getByRole("spinbutton", { name: "Day" }), day!);
  await userEvent.fill(field.getByRole("spinbutton", { name: "Year" }), year!);
};

/** Opens a portaled MUI listbox, picks an option, and waits for it to close. */
const selectOption = async (combobox: Locator, option: RegExp) => {
  await userEvent.click(combobox);
  // The listbox is portaled OUTSIDE the dialog, so the option is page-scoped.
  await userEvent.click(page.getByRole("option", { name: option }));
  await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
};

const fillBlock = async (
  number: number,
  { slot, group, days }: { slot: RegExp; group: RegExp; days: string[] },
) => {
  const block = region(number);
  await selectOption(block.getByRole("combobox", { name: /Time slot/ }), slot);
  await selectOption(block.getByRole("combobox", { name: /Group/ }), group);
  for (const day of days) {
    await userEvent.click(block.getByRole("checkbox", { name: day }));
  }
};

type WireRule = { day: number; timeSlotId: string; groupId: string };

const submittedRules = (call: unknown): WireRule[] =>
  (call as { data: { scheduleRules: WireRule[] } }).data.scheduleRules;

describe("ChildScheduleDialog", () => {
  beforeEach(async () => {
    await page.viewport(1280, 900);
    mocks.timeSlots = { data: [SLOT_MORNING, SLOT_AFTERNOON], isPending: false, isError: false };
    mocks.groups = { data: [GROUP_STARS, GROUP_SUNS], isPending: false, isError: false };
    mocks.childSchedules = { data: [] };
    mocks.addSchedule.mockReset();
    mocks.addSchedule.mockResolvedValue(SCHEDULE_ID);
    mocks.updateSchedule.mockReset();
    mocks.updateSchedule.mockResolvedValue(SCHEDULE_ID);
    mocks.enqueueSnackbar.mockReset();
  });

  it("opens on one empty planningsregel and describes the child", async () => {
    await openAddDialog();

    await expect.element(dialog()).toHaveAccessibleName("Add schedule");
    await expect.element(dialog().getByText("Schedule for Lars Jansen")).toBeVisible();
    await expect.element(region(1)).toBeVisible();
    await expect.element(dialog().getByRole("region", { name: "Block 2" })).not.toBeInTheDocument();
    await expect.element(submitButton(/Create Schedule/)).toBeDisabled();
  });

  it("submits one command with one rule per ticked day", async () => {
    await openAddDialog();

    await fillStartDate("2026-09-01");
    await fillBlock(1, {
      slot: /Ochtend/,
      group: /Sterretjes/,
      days: ["Monday", "Tuesday", "Thursday"],
    });

    // The recap counts dagdelen, never wire-level rules.
    await expect.element(dialog().getByText(/3 day parts/)).toBeVisible();

    const submit = submitButton(/Create Schedule/);
    await expect.element(submit).toBeEnabled();
    await userEvent.click(submit);

    await vi.waitFor(() => {
      expect(mocks.addSchedule).toHaveBeenCalledTimes(1);
    });

    const [command] = mocks.addSchedule.mock.calls[0]!;
    expect(command).toMatchObject({ data: { childId: CHILD_ID, startDate: "2026-09-01" } });
    // One planningsregel over three days fans out to exactly three wire rules,
    // Monday-first, with numeric day values.
    expect(submittedRules(command)).toEqual([
      { day: 1, timeSlotId: SLOT_MORNING.id, groupId: GROUP_STARS.id },
      { day: 2, timeSlotId: SLOT_MORNING.id, groupId: GROUP_STARS.id },
      { day: 4, timeSlotId: SLOT_MORNING.id, groupId: GROUP_STARS.id },
    ]);

    expect(mocks.enqueueSnackbar).toHaveBeenCalledTimes(1);
    await expect.element(dialog()).not.toBeInTheDocument();
  });

  it("blocks a day that is already planned in the same time slot", async () => {
    await openAddDialog();

    await fillBlock(1, { slot: /Ochtend/, group: /Sterretjes/, days: ["Monday"] });
    await userEvent.click(dialog().getByRole("button", { name: "Add block" }));

    const second = region(2);
    await expect.element(second).toBeVisible();
    await selectOption(second.getByRole("combobox", { name: /Time slot/ }), /Ochtend/);

    await expect.element(second.getByRole("checkbox", { name: "Monday" })).toBeDisabled();
    await expect.element(second.getByText(/Already planned in Ochtend/)).toBeVisible();
    // Only that one day is claimed; the rest of the week stays open.
    for (const day of ["Tuesday", "Wednesday", "Sunday"]) {
      await expect.element(second.getByRole("checkbox", { name: day })).toBeEnabled();
    }
    // The first planningsregel never blocks its own day.
    await expect.element(region(1).getByRole("checkbox", { name: "Monday" })).toBeEnabled();
  });

  it("allows the same day in a different time slot", async () => {
    await openAddDialog();

    await fillStartDate("2026-09-01");
    await fillBlock(1, { slot: /Ochtend/, group: /Sterretjes/, days: ["Monday"] });
    await userEvent.click(dialog().getByRole("button", { name: "Add block" }));

    const second = region(2);
    await selectOption(second.getByRole("combobox", { name: /Time slot/ }), /Middag/);
    // A different time slot never blocks a day.
    const monday = second.getByRole("checkbox", { name: "Monday" });
    await expect.element(monday).toBeEnabled();
    await userEvent.click(monday);
    await selectOption(second.getByRole("combobox", { name: /Group/ }), /Zonnetjes/);

    await userEvent.click(submitButton(/Create Schedule/));

    await vi.waitFor(() => {
      expect(mocks.addSchedule).toHaveBeenCalledTimes(1);
    });
    expect(submittedRules(mocks.addSchedule.mock.calls[0]![0])).toEqual([
      { day: 1, timeSlotId: SLOT_MORNING.id, groupId: GROUP_STARS.id },
      { day: 1, timeSlotId: SLOT_AFTERNOON.id, groupId: GROUP_SUNS.id },
    ]);
  });

  it("reports a dayless planningsregel inline, never through a snackbar", async () => {
    await openAddDialog();

    await fillStartDate("2026-09-01");
    await fillBlock(1, { slot: /Ochtend/, group: /Sterretjes/, days: [] });

    const monday = region(1).getByRole("checkbox", { name: "Monday" });
    await userEvent.click(monday);
    await userEvent.click(monday);

    // Inline FormHelperText inside the planningsregel — not a snackbar and not
    // a second role="alert".
    await expect.element(region(1).getByText("Select at least one day")).toBeVisible();
    await expect.element(submitButton(/Create Schedule/)).toBeDisabled();
    await expect.element(dialog().getByText("Still needed: days in block 1")).toBeVisible();
    await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
    expect(mocks.addSchedule).not.toHaveBeenCalled();
    expect(mocks.enqueueSnackbar).not.toHaveBeenCalled();
  });

  it("replaces the planningsregels with a setup panel when no time slot exists", async () => {
    mocks.timeSlots = { data: [], isPending: false, isError: false };
    await openAddDialog();

    await expect
      .element(
        dialog().getByText(
          "No time slots configured yet. Set one up before you create a schedule.",
        ),
      )
      .toBeVisible();
    await expect.element(dialog().getByRole("link", { name: "Manage time slots" })).toBeVisible();
    await expect.element(region(1)).not.toBeInTheDocument();

    // Hard-disabled: a valid start date does not buy its way past the gate.
    await fillStartDate("2026-09-01");
    await expect.element(submitButton(/Create Schedule/)).toBeDisabled();
    expect(mocks.addSchedule).not.toHaveBeenCalled();
  });

  it("preloads the stored rules in edit mode and summarises the change", async () => {
    await openEditDialog([
      { day: 1, timeSlotId: SLOT_MORNING.id, groupId: GROUP_STARS.id },
      { day: 3, timeSlotId: SLOT_MORNING.id, groupId: GROUP_STARS.id },
    ]);

    await expect.element(dialog()).toHaveAccessibleName("Edit Schedule");
    // Two rules with the same (slot, group) load as ONE planningsregel of two days.
    const block = region(1);
    await expect.element(block).toBeVisible();
    await expect.element(dialog().getByRole("region", { name: "Block 2" })).not.toBeInTheDocument();
    await expect.element(block.getByRole("checkbox", { name: "Monday" })).toBeChecked();
    await expect.element(block.getByRole("checkbox", { name: "Wednesday" })).toBeChecked();
    await expect.element(block.getByRole("checkbox", { name: "Tuesday" })).not.toBeChecked();
    await expect
      .element(block.getByRole("combobox", { name: /Time slot/ }))
      .toHaveTextContent("Ochtend");

    // Untouched: nothing to save and nothing to reset.
    await expect.element(dialog().getByText("You have not changed anything yet.")).toBeVisible();
    await expect.element(submitButton(/Update Schedule/)).toBeDisabled();
    await expect.element(submitButton(/Reset to saved schedule/)).toBeDisabled();
    await expect.element(dialog().getByRole("heading", { name: "Added" })).not.toBeInTheDocument();

    await userEvent.click(block.getByRole("checkbox", { name: "Friday" }));
    await userEvent.click(block.getByRole("checkbox", { name: "Monday" }));

    await expect
      .element(dialog().getByText(/You are replacing the whole weekly pattern from 01-09-2026/))
      .toBeVisible();
    const added = dialog().getByRole("heading", { name: "Added" });
    const removed = dialog().getByRole("heading", { name: "Removed" });
    await expect.element(added).toBeVisible();
    await expect.element(removed).toBeVisible();
    await expect.element(dialog().getByText("Fri · Ochtend · Sterretjes")).toBeVisible();
    await expect.element(dialog().getByText("Mon · Ochtend · Sterretjes")).toBeVisible();

    await userEvent.click(submitButton(/Update Schedule/));

    await vi.waitFor(() => {
      expect(mocks.updateSchedule).toHaveBeenCalledTimes(1);
    });
    const [command] = mocks.updateSchedule.mock.calls[0]!;
    expect(command).toMatchObject({ id: SCHEDULE_ID, data: { startDate: "2026-09-01" } });
    expect(submittedRules(command)).toEqual([
      { day: 3, timeSlotId: SLOT_MORNING.id, groupId: GROUP_STARS.id },
      { day: 5, timeSlotId: SLOT_MORNING.id, groupId: GROUP_STARS.id },
    ]);
    expect(mocks.addSchedule).not.toHaveBeenCalled();
  });

  it("keeps a rule whose time slot no longer exists instead of dropping it", async () => {
    const deletedSlotId = "slot-deleted";
    await openEditDialog([{ day: 1, timeSlotId: deletedSlotId, groupId: GROUP_STARS.id }]);

    const block = region(1);
    await expect
      .element(block.getByRole("combobox", { name: /Time slot/ }))
      .toHaveTextContent("Unknown time slot");
    await expect.element(block.getByRole("checkbox", { name: "Monday" })).toBeChecked();

    // Nothing is silently dropped and nothing is silently saved: editing another
    // field leaves the stale slot in place and keeps submit shut.
    await userEvent.click(block.getByRole("checkbox", { name: "Tuesday" }));
    await expect.element(submitButton(/Update Schedule/)).toBeDisabled();
    expect(mocks.updateSchedule).not.toHaveBeenCalled();

    // Re-picking a live time slot repairs the planningsregel, keeping both days.
    await selectOption(block.getByRole("combobox", { name: /Time slot/ }), /Middag/);
    await expect.element(submitButton(/Update Schedule/)).toBeEnabled();
    await userEvent.click(submitButton(/Update Schedule/));

    await vi.waitFor(() => {
      expect(mocks.updateSchedule).toHaveBeenCalledTimes(1);
    });
    expect(submittedRules(mocks.updateSchedule.mock.calls[0]![0])).toEqual([
      { day: 1, timeSlotId: SLOT_AFTERNOON.id, groupId: GROUP_STARS.id },
      { day: 2, timeSlotId: SLOT_AFTERNOON.id, groupId: GROUP_STARS.id },
    ]);
  });

  it("keeps focus on the day checkbox that was just toggled", async () => {
    await openAddDialog();

    await fillBlock(1, { slot: /Ochtend/, group: /Sterretjes/, days: [] });

    const block = region(1);
    const monday = block.getByRole("checkbox", { name: "Monday" });
    await userEvent.click(monday);
    await expect.element(monday).toBeChecked();

    // Regression net for the in-render-body components: a remount would send
    // focus back to BODY (or to the dialog paper via MUI's FocusTrap).
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(monday.element());
    });

    const wednesday = block.getByRole("checkbox", { name: "Wednesday" });
    await userEvent.click(wednesday);
    await expect.element(wednesday).toBeChecked();
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(wednesday.element());
    });
    await expect.element(monday).toBeChecked();
  });

  /**
   * Stored data can predate the day-per-time-slot invariant: the API only ever
   * rejected an identical (day, timeSlot, group) triple, so Monday can legally
   * sit in one slot under two different groups. Loading must be lossless, and
   * the user must still be able to repair it.
   */
  describe("with stored rules that break the day-per-time-slot invariant", () => {
    /** Monday appears twice in Ochtend, under two different groups. */
    const COLLIDING_RULES: ChildScheduleListVMScheduleRule[] = [
      { day: 1, timeSlotId: SLOT_MORNING.id, groupId: GROUP_STARS.id },
      { day: 1, timeSlotId: SLOT_MORNING.id, groupId: GROUP_SUNS.id },
      { day: 2, timeSlotId: SLOT_MORNING.id, groupId: GROUP_SUNS.id },
    ];

    it("restores every day when the draft is reset after a time-slot change", async () => {
      await openEditDialog(COLLIDING_RULES);

      const second = region(2);
      await expect.element(second.getByRole("checkbox", { name: "Monday" })).toBeChecked();
      await expect.element(second.getByRole("checkbox", { name: "Tuesday" })).toBeChecked();

      // Move the second planningsregel to a slot where nothing collides.
      await selectOption(second.getByRole("combobox", { name: /Time slot/ }), /Middag/);
      await expect.element(second.getByRole("checkbox", { name: "Monday" })).toBeChecked();

      const reset = dialog().getByRole("button", { name: "Reset to saved schedule" });
      await expect.element(reset).toBeEnabled();
      await userEvent.click(reset);

      // Regression net: the drop-colliding-days rule used to be inferred from a
      // value diff, so reset() looked like a user slot change and silently
      // deleted Monday from the restored planning — then enabled submit, which
      // saved the deletion.
      await expect.element(second.getByRole("checkbox", { name: "Monday" })).toBeChecked();
      await expect.element(second.getByRole("checkbox", { name: "Tuesday" })).toBeChecked();
      await expect.element(reset).toBeDisabled();
      expect(mocks.updateSchedule).not.toHaveBeenCalled();
    });

    it("leaves a doubly-claimed day operable so the collision can be repaired", async () => {
      await openEditDialog(COLLIDING_RULES);

      const firstMonday = region(1).getByRole("checkbox", { name: "Monday" });
      const secondMonday = region(2).getByRole("checkbox", { name: "Monday" });

      // Checked in both planningsregels, and enabled in both: disabling a day
      // that is already ticked here made such a planning a dead end.
      await expect.element(firstMonday).toBeChecked();
      await expect.element(firstMonday).toBeEnabled();
      await expect.element(secondMonday).toBeChecked();
      await expect.element(secondMonday).toBeEnabled();

      await userEvent.click(firstMonday);
      await expect.element(firstMonday).not.toBeChecked();

      // Now that it is no longer ticked here, the other planningsregel's claim
      // applies and re-adding it is blocked.
      await expect.element(firstMonday).toBeDisabled();
      await expect.element(secondMonday).toBeChecked();
    });
  });
});
