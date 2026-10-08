import { beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithProviders } from "../../test/renderWithProviders";
import { Component as WaitlistPage } from "./WaitlistPage";
import type { WaitlistEntry } from "@features/waitlist/waitlist.types";

const api = vi.hoisted(() => ({ list: vi.fn(), status: vi.fn() }));
vi.mock("@features/waitlist/waitlist.api", () => ({
  listWaitlistEntries: api.list,
  updateWaitlistEntryStatus: api.status,
  waitlistQueryKey: (filters: unknown) => ["waitlist", filters],
}));
const entry: WaitlistEntry = {
  id: "request-1",
  givenName: "Jane",
  familyName: "Doe",
  fullName: "Jane Doe",
  dateOfBirth: "2025-01-01",
  desiredStartDate: "2027-01-15",
  contactName: "Parent",
  contactEmail: "parent@example.test",
  registeredAt: "2026-10-01T09:00:00Z",
  status: "Waiting",
  location: "North",
  weekdays: [1, 4],
  priority: 10,
  priorityReason: "Sibling",
  priorityExplanation: "Sibling attends North",
  revision: "revision-1",
  statusHistory: [],
};
beforeEach(() => {
  api.list.mockResolvedValue([entry]);
  api.status.mockResolvedValue(undefined);
});
describe("waitlist shortlist", () => {
  it("shows placement preferences and priority reasons and filters on location", async () => {
    await renderWithProviders(<WaitlistPage />);
    await expect.element(page.getByRole("link", { name: "Jane Doe" })).toBeVisible();
    await expect.element(page.getByText("Sibling attends North")).toBeVisible();
    await userEvent.fill(page.getByRole("textbox", { name: "Preferred location" }), "North");
    await userEvent.click(page.getByRole("button", { name: "Filter location" }));
    await vi.waitFor(() =>
      expect(api.list).toHaveBeenLastCalledWith({
        includeClosed: false,
        location: "North",
        startMonth: "",
        status: "",
      }),
    );
    await userEvent.click(page.getByRole("button", { name: "Clear filters" }));
    await expect.element(page.getByRole("textbox", { name: "Preferred location" })).toHaveValue("");
  });
  it("sends the displayed revision with a status change", async () => {
    await renderWithProviders(<WaitlistPage />);
    await userEvent.click(page.getByRole("combobox", { name: "Status for Jane Doe" }));
    await userEvent.click(page.getByRole("option", { name: "Offered" }));
    await vi.waitFor(() =>
      expect(api.status).toHaveBeenCalledWith("request-1", "Offered", "revision-1"),
    );
  });
  it("shows a load failure instead of an empty waitlist", async () => {
    api.list.mockRejectedValue(new Error("offline"));
    await renderWithProviders(<WaitlistPage />);
    await expect
      .element(page.getByText("Could not load waitlist. Please try again."))
      .toBeVisible();
    await expect
      .element(page.getByText("No requests match these filters."))
      .not.toBeInTheDocument();
  });
});
