import { ThemeProvider, getContrastRatio } from "@mui/material/styles";
import { page } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";

import type { ScheduleByDateVM } from "@api/scheduling/models/scheduleByDateVM";
import { theme } from "@lib/theme";
import { renderWithProviders } from "../test/renderWithProviders";

vi.mock("@api/crm/endpoints/children/children", () => ({
  useGetChildById: () => ({
    data: { givenName: "Jane", familyName: "Doe" },
    isLoading: false,
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

const importChildCard = async () => (await import("./ChildCard")).default;

const schedule = {
  age: 3,
  startTime: "08:00:00",
  endTime: "17:00:00",
  timeSlotName: "Whole day",
} as ScheduleByDateVM;

describe("ChildCard avatar contrast", () => {
  // For a one-character ID, the hash is its character code. These IDs therefore
  // select categorical palette indexes 0 through 7 without depending on random UUIDs.
  it.each(["@", "A", "B", "C", "D", "E", "F", "G"])(
    "meets WCAG AA for categorical color selected by child ID %s",
    async (childId) => {
      const ChildCard = await importChildCard();

      await renderWithProviders(
        <ThemeProvider theme={theme}>
          <ChildCard childId={childId} schedule={schedule} />
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
