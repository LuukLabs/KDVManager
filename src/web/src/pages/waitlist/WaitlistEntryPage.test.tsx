import { beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ApiError } from "@api/errors/types";
import { Component as WaitlistEntryPage } from "./WaitlistEntryPage";
import type { WaitlistEntry } from "@features/waitlist/waitlist.types";

const api = vi.hoisted(() => ({ get: vi.fn(), update: vi.fn() }));
vi.mock("@features/waitlist/waitlist.api", () => ({
  getWaitlistEntry: api.get,
  updateWaitlistEntry: api.update,
  waitlistEntryQueryKey: (id: string) => ["waitlist-entry", id],
}));
vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual<typeof import("react-router-dom")>("react-router-dom")),
  useParams: () => ({ id: "request-1" }),
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
  status: "Offered",
  weekdays: [1, 4],
  priority: 0,
  revision: "revision-1",
  statusHistory: [
    {
      previousStatus: "Waiting",
      status: "Offered",
      changedBy: "auth0|planner",
      changedAt: "2026-10-02T09:00:00Z",
    },
  ],
};
beforeEach(() => {
  api.get.mockResolvedValue(entry);
  api.update.mockResolvedValue(undefined);
});
describe("waitlist request detail", () => {
  it("shows the status history actor", async () => {
    await renderWithProviders(<WaitlistEntryPage />);
    await expect.element(page.getByText(/Changed by auth0\|planner/)).toBeVisible();
  });
  it("keeps unsaved edits after a conflict and lets the planner explicitly reload", async () => {
    api.update.mockRejectedValueOnce(new ApiError({ message: "Conflict", status: 409 }));
    await renderWithProviders(<WaitlistEntryPage />);
    await userEvent.fill(page.getByRole("textbox", { name: "Voornaam" }), "Unsaved");
    await userEvent.click(page.getByRole("button", { name: "Save request" }));
    await expect
      .element(
        page.getByText(
          "This request was changed by another planner. Reload it before saving again.",
        ),
      )
      .toBeVisible();
    await expect.element(page.getByRole("textbox", { name: "Voornaam" })).toHaveValue("Unsaved");
    api.get.mockResolvedValue({ ...entry, revision: "revision-2" });
    await userEvent.click(
      page.getByRole("button", { name: "Reload request and discard unsaved changes" }),
    );
    await expect.element(page.getByRole("textbox", { name: "Voornaam" })).toHaveValue("Jane");
    await userEvent.click(page.getByRole("button", { name: "Save request" }));
    await vi.waitFor(() =>
      expect(api.update).toHaveBeenNthCalledWith(
        2,
        "request-1",
        expect.objectContaining({ givenName: "Jane" }),
        "revision-2",
      ),
    );
  });
});
