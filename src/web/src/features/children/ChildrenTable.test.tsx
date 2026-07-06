import { describe, it, expect, vi, beforeEach } from "vitest";
import { page, userEvent } from "vitest/browser";
import NiceModal from "@ebay/nice-modal-react";
import { SnackbarProvider } from "notistack";
import { ApiError } from "@api/errors/types";

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

const useListChildrenMock = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@api/crm/endpoints/children/children", () => ({
  useListChildren: useListChildrenMock,
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
  useListChildrenMock.mockReset();
  useListChildrenMock.mockReturnValue({
    data: CHILDREN,
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  });
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
  });

  it("navigates to the child detail page when a card is tapped (mobile)", async () => {
    await page.viewport(375, 667);
    await renderTable();

    await userEvent.click(page.getByRole("button", { name: "John Smith" }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/children/child-2");
  });
});

describe("ChildrenTable — server error state (browser)", () => {
  it("shows an error alert instead of an empty table when the query fails (desktop)", async () => {
    const refetchMock = vi.fn();
    useListChildrenMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: new ApiError({ message: "Server error", status: 500, type: "server" }),
      refetch: refetchMock,
    });

    await page.viewport(1280, 800);
    await renderTable();

    await expect.element(page.getByText("Server error")).toBeVisible();

    await userEvent.click(page.getByRole("button", { name: "Retry" }));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows an error alert instead of an empty list when the query fails (mobile)", async () => {
    const refetchMock = vi.fn();
    useListChildrenMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: new ApiError({ message: "Server error", status: 500, type: "server" }),
      refetch: refetchMock,
    });

    await page.viewport(375, 667);
    await renderTable();

    await expect.element(page.getByText("Server error")).toBeVisible();

    await userEvent.click(page.getByRole("button", { name: "Retry" }));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
});
