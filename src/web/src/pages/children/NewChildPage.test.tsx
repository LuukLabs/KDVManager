import { describe, it, expect, vi, beforeEach } from "vitest";
import { page, userEvent } from "vitest/browser";

import { renderWithProviders } from "../../test/renderWithProviders";

// ----- Mocks --------------------------------------------------------------

const mutateMock = vi.fn();
const navigateMock = vi.fn();

vi.mock("@api/crm/endpoints/children/children", () => ({
  useAddChild: () => ({ mutate: mutateMock }),
  getListChildrenQueryKey: () => ["children"],
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// Import the page AFTER the mocks are registered.
const importPage = async () => (await import("./NewChildPage")).Component;

beforeEach(() => {
  mutateMock.mockReset();
  navigateMock.mockReset();
});

describe("NewChildPage — date field wire-up (browser)", () => {
  it("submits dateOfBirth as a 'YYYY-MM-DD' string to the API", async () => {
    const NewChildPage = await importPage();

    await renderWithProviders(<NewChildPage />);

    await userEvent.fill(page.getByLabelText(/voornaam/i), "Jane");
    await userEvent.fill(page.getByLabelText(/achternaam/i), "Doe");

    // Open calendar.
    await userEvent.click(page.getByRole("button", { name: /choose date/i }));

    // Switch to year view, pick 2020.
    await userEvent.click(page.getByRole("button", { name: /calendar view is open/i }));
    await userEvent.click(page.getByRole("radio", { name: "2020" }));

    // Now in month view; pick day 15 regardless of which month is shown —
    // the assertion below only cares about the wire format and year/day.
    await userEvent.click(page.getByRole("gridcell", { name: "15" }));

    await userEvent.click(page.getByRole("button", { name: /^save$/i }));

    await vi.waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(1));

    const [args] = mutateMock.mock.calls[0]!;
    expect(args).toMatchObject({
      data: {
        givenName: "Jane",
        familyName: "Doe",
      },
    });

    const sentDate = (args as { data: { dateOfBirth: unknown } }).data.dateOfBirth;
    expect(typeof sentDate).toBe("string");
    expect(sentDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect((sentDate as string).slice(-2)).toBe("15");
    expect((sentDate as string).slice(0, 4)).toBe("2020");
  });

  it("blocks submission and shows a required error when the date is empty", async () => {
    const NewChildPage = await importPage();

    await renderWithProviders(<NewChildPage />);

    await userEvent.fill(page.getByLabelText(/voornaam/i), "Jane");
    await userEvent.fill(page.getByLabelText(/achternaam/i), "Doe");

    await userEvent.click(page.getByRole("button", { name: /^save$/i }));

    await expect.element(page.getByText(/this field is required/i)).toBeVisible();
    expect(mutateMock).not.toHaveBeenCalled();
  });
});
