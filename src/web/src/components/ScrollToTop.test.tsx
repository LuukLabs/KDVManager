import { useState } from "react";
import { expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { renderWithProviders } from "../test/renderWithProviders";
import { ScrollToTop } from "./ScrollToTop";

const Harness = () => {
  const [childId, setChildId] = useState("child-1");

  const openAnotherChild = () => {
    window.scrollTo({ top: 500, left: 0, behavior: "auto" });
    setChildId("child-2");
  };

  return (
    <div style={{ minHeight: 2000 }}>
      <ScrollToTop resetKey={childId} />
      <button type="button" onClick={openAnotherChild}>
        Open child
      </button>
    </div>
  );
};

it("resets the document scroll position when a different child opens", async () => {
  await page.viewport(375, 667);
  await renderWithProviders(<Harness />);

  await userEvent.click(page.getByRole("button", { name: "Open child" }));

  await expect.poll(() => window.scrollY).toBe(0);
});
