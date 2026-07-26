import { ThemeProvider, getContrastRatio } from "@mui/material/styles";
import { page } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";

import type { DagdeelRow } from "@features/attendance/types";
import { theme } from "@lib/theme";
import { renderWithProviders } from "../test/renderWithProviders";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

const importChildCard = async () => (await import("./ChildCard")).default;

// The name now arrives on the row itself — the board no longer fetches each
// child from CRM just to render a card.
const buildRow = (childId: string, overrides: Partial<DagdeelRow> = {}): DagdeelRow => ({
  key: `${childId}:group:slot`,
  scheduleId: "schedule-1",
  childId,
  childFullName: "Jane Doe",
  groupId: "group",
  timeSlotId: "slot",
  timeSlotName: "Whole day",
  plannedStart: "08:00:00",
  plannedEnd: "17:00:00",
  age: 3,
  status: "expected",
  ...overrides,
});

describe("ChildCard avatar contrast", () => {
  // For a one-character ID, the hash is its character code. These IDs therefore
  // select categorical palette indexes 0 through 7 without depending on random UUIDs.
  it.each(["@", "A", "B", "C", "D", "E", "F", "G"])(
    "meets WCAG AA for categorical color selected by child ID %s",
    async (childId) => {
      const ChildCard = await importChildCard();

      await renderWithProviders(
        <ThemeProvider theme={theme}>
          <ChildCard row={buildRow(childId)} />
        </ThemeProvider>,
      );

      await expect.element(page.getByText("JD")).toBeVisible();
      const avatar = document.querySelector<HTMLElement>(".MuiAvatar-root");
      expect(avatar).not.toBeNull();

      const styles = getComputedStyle(avatar!);
      expect(getContrastRatio(styles.color, styles.backgroundColor)).toBeGreaterThanOrEqual(4.5);
    },
  );
});

describe("ChildCard status", () => {
  it("names an absent child's state in text and gives the reason, not just a dimmed card", async () => {
    const ChildCard = await importChildCard();

    await renderWithProviders(
      <ThemeProvider theme={theme}>
        <ChildCard row={buildRow("A", { status: "reportedAbsent", absenceReason: "ziek" })} />
      </ThemeProvider>,
    );

    // The test i18n bootstrap ships no resources, so t() yields its key.
    await expect.element(page.getByText("Reported absent")).toBeVisible();
    await expect.element(page.getByText(/ziek/)).toBeVisible();
  });

  it("keeps the dossier link out of the actions slot so a control is not nested in a button", async () => {
    const ChildCard = await importChildCard();

    await renderWithProviders(
      <ThemeProvider theme={theme}>
        <ChildCard row={buildRow("A")} actions={<button type="button">Inchecken</button>} />
      </ThemeProvider>,
    );

    const action = page.getByRole("button", { name: "Inchecken" });
    await expect.element(action).toBeVisible();
    // The slot's button must not live inside the card's own action area.
    const actionEl = document.querySelector<HTMLElement>("button.MuiButtonBase-root");
    expect(actionEl).not.toBeNull();
    const slotButton = [...document.querySelectorAll("button")].find(
      (b) => b.textContent === "Inchecken",
    );
    expect(slotButton).toBeDefined();
    expect(slotButton!.closest(".MuiCardActionArea-root")).toBeNull();
  });
});
