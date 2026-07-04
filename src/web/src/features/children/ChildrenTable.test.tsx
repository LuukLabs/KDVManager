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

describe("ChildrenTable — row navigation (browser)", () => {
  it("navigates to the child detail page when a row is clicked (desktop)", async () => {
    await page.viewport(1280, 800);
    await renderTable();

    await userEvent.click(page.getByRole("gridcell", { name: "Jane Doe" }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/children/child-1");
  });

  it("opens the delete confirmation without navigating when delete is clicked (desktop)", async () => {
    await page.viewport(1280, 800);
    await renderTable();

    await userEvent.click(page.getByRole("button", { name: "Delete child" }).first());

    await expect.element(page.getByText("Remove child 'Jane Doe'")).toBeVisible();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("navigates to the child detail page when a card is tapped (mobile)", async () => {
    await page.viewport(375, 667);
    await renderTable();

    await userEvent.click(page.getByRole("button", { name: "John Smith" }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/children/child-2");
  });
});
