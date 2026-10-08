import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithProviders } from "../../test/renderWithProviders";
import { WaitlistEntryForm } from "./WaitlistEntryForm";
import type { CreateWaitlistEntry } from "./waitlist.types";

const entry: CreateWaitlistEntry = {
  givenName: "Jane",
  familyName: "Doe",
  dateOfBirth: "2025-01-01",
  desiredStartDate: "2027-01-15",
  contactName: "Parent",
  contactEmail: "parent@example.test",
  weekdays: [],
  priority: 0,
};
describe("waitlist preferences", () => {
  it("submits structured weekdays and preserves legacy request text", async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    await renderWithProviders(
      <WaitlistEntryForm
        entry={{ ...entry, requestedDays: "Flexible Mondays" }}
        onSubmit={submit}
      />,
    );
    await userEvent.click(page.getByRole("checkbox", { name: "Monday" }));
    await userEvent.click(page.getByRole("checkbox", { name: "Thursday" }));
    await userEvent.click(page.getByRole("checkbox", { name: "Sunday" }));
    await userEvent.fill(page.getByRole("textbox", { name: "Preferred location" }), "North");
    await userEvent.click(page.getByRole("button", { name: "Save request" }));
    await vi.waitFor(() =>
      expect(submit).toHaveBeenCalledWith(
        expect.objectContaining({
          weekdays: [1, 4, 0],
          location: "North",
          requestedDays: "Flexible Mondays",
          priority: 0,
          careType: null,
        }),
      ),
    );
  });
  it("requires an explanation when a priority is set", async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    await renderWithProviders(<WaitlistEntryForm entry={entry} onSubmit={submit} />);
    await userEvent.fill(page.getByRole("spinbutton", { name: "Priority (0–100)" }), "10");
    await userEvent.click(page.getByRole("button", { name: "Save request" }));
    expect(submit).not.toHaveBeenCalled();
    await userEvent.fill(page.getByRole("textbox", { name: "Priority reason" }), "Sibling");
    await userEvent.fill(
      page.getByRole("textbox", { name: "Priority explanation" }),
      "Sibling attends North",
    );
    await userEvent.click(page.getByRole("button", { name: "Save request" }));
    await vi.waitFor(() =>
      expect(submit).toHaveBeenCalledWith(
        expect.objectContaining({ priority: 10, priorityReason: "Sibling" }),
      ),
    );
  });
});
