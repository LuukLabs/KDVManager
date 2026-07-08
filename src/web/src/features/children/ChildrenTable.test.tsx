import { describe, it, expect, vi, beforeEach } from "vitest";
import { page, userEvent } from "vitest/browser";
import NiceModal from "@ebay/nice-modal-react";
import { SnackbarProvider } from "notistack";

import { renderWithProviders } from "../../test/renderWithProviders";

// ----- Mocks --------------------------------------------------------------

const navigateMock = vi.fn();

const CHILDREN = vi.hoisted(() => [
  {
    id: "child-1",
    fullName: "Jane Doe",
    childNumber: 1,
    dateOfBirth: "2020-01-15",
    schedulingStatus: "Active",
    statusRelevantDate: null,
  },
  {
    id: "child-2",
    fullName: "John Smith",
    childNumber: 2,
    dateOfBirth: "2021-03-02",
    schedulingStatus: "NoPlanning",
    statusRelevantDate: null,
  },
]);

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@api/crm/endpoints/children/children", () => ({
  useListChildren: () => ({ data: CHILDREN, isLoading: false, isFetching: false }),
  useDeleteChild: () => ({ mutateAsync: vi.fn(), isPending: false }),
  getListChildrenQueryKey: () => ["children"],
}));

// Import the table AFTER the mocks are registered.
const importTable = async () => (await import("./ChildrenTable")).ChildrenTable;

const renderTable = async () => {
  const ChildrenTable = await importTable();
  return renderWithProviders(
    <NiceModal.Provider>
      <SnackbarProvider>
        <ChildrenTable />
      </SnackbarProvider>
    </NiceModal.Provider>,
  );
};

beforeEach(() => {
  navigateMock.mockReset();
});

describe("ChildrenTable — record navigation (browser)", () => {
  it("renders the child name as a link to the detail page (desktop)", async () => {
    await page.viewport(1280, 800);
    await renderTable();

    await expect
      .element(page.getByRole("link", { name: "Jane Doe" }))
      .toHaveAttribute("href", "/children/child-1");
    await expect
      .element(page.getByRole("link", { name: "John Smith" }))
      .toHaveAttribute("href", "/children/child-2");
  });

  it("opens the delete confirmation when delete is clicked (desktop)", async () => {
    await page.viewport(1280, 800);
    await renderTable();

    await userEvent.click(page.getByRole("button", { name: "Delete child" }).first());

    await expect.element(page.getByText("Remove child 'Jane Doe'")).toBeVisible();
    expect(navigateMock).not.toHaveBeenCalled();

    // Close the dialog before the test ends: it renders into a portal with a
    // full-screen backdrop, and on slow machines the leaked backdrop blocks
    // the tap in the next test (failure screenshots show the dialog still
    // open on top of the mobile card list).
    await userEvent.click(page.getByRole("button", { name: "Cancel" }));
    // The dialog closes with a transition and then unmounts, so the element is
    // removed from the DOM. Assert absence rather than invisibility: a missing
    // element has no visibility to evaluate, which is what made this flaky.
    await expect.element(page.getByText("Remove child 'Jane Doe'")).not.toBeInTheDocument();
  });

  it("navigates to the child detail page when a card is tapped (mobile)", async () => {
    await page.viewport(375, 667);
    await renderTable();

    await userEvent.click(page.getByRole("button", { name: "John Smith" }));

    // The click handler can land a tick after the CDP click resolves on slow
    // runners (failure screenshots show the tap ripple on the right card with
    // navigate not yet called), so poll instead of asserting synchronously.
    await vi.waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/children/child-2");
    });
    expect(navigateMock).toHaveBeenCalledTimes(1);
  });
});
