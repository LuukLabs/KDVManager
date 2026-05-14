import { useForm } from "react-hook-form";
import { describe, it, expect, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { Dayjs } from "dayjs";

import { Form } from "./Form";
import { FormDatePicker } from "./FormDatePicker";
import { renderWithProviders } from "../../test/renderWithProviders";

type FormShape = {
  dateOfBirth: string | null;
};

type HarnessProps = {
  defaultValue?: string | null;
  required?: boolean;
  onSubmit: (data: FormShape) => void;
};

const Harness = ({ defaultValue = null, required = true, onSubmit }: HarnessProps) => {
  const formContext = useForm<FormShape>({
    defaultValues: { dateOfBirth: defaultValue },
  });

  return (
    <Form formContext={formContext} onSubmit={onSubmit}>
      <FormDatePicker<FormShape>
        label="Date of birth"
        name="dateOfBirth"
        required={required}
        transform={{
          output: (value: Dayjs | null) => (value ? value.format("YYYY-MM-DD") : null),
        }}
        slotProps={{ textField: { fullWidth: true } }}
      />
      <button type="submit">submit</button>
    </Form>
  );
};

describe("FormDatePicker (browser)", () => {
  it("submits a pre-filled string value as 'YYYY-MM-DD'", async () => {
    const onSubmit = vi.fn();

    await renderWithProviders(<Harness defaultValue="2020-05-15" onSubmit={onSubmit} />);

    // Locator-style assertions auto-retry until the element is visible.
    const field = page.getByRole("group", { name: /date of birth/i });
    await expect.element(field).toBeVisible();
    // The MM/DD/YYYY ("en") locale shows month first.
    await expect.element(field).toHaveTextContent("05");
    await expect.element(field).toHaveTextContent("15");
    await expect.element(field).toHaveTextContent("2020");

    await userEvent.click(page.getByRole("button", { name: /submit/i }));

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ dateOfBirth: "2020-05-15" }),
      expect.anything(),
    );
  });

  it("emits the string 'YYYY-MM-DD' (not a Date or Dayjs) when the user picks a day", async () => {
    const onSubmit = vi.fn();

    await renderWithProviders(<Harness defaultValue="2020-05-15" onSubmit={onSubmit} />);

    // Open the calendar popover.
    await userEvent.click(page.getByRole("button", { name: /choose date/i }));

    // The picker opens to May 2020 — pick the 20th.
    await userEvent.click(page.getByRole("gridcell", { name: "20" }));

    await userEvent.click(page.getByRole("button", { name: /submit/i }));

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const submitted = onSubmit.mock.calls[0]![0] as FormShape;
    expect(typeof submitted.dateOfBirth).toBe("string");
    expect(submitted.dateOfBirth).toBe("2020-05-20");
  });

  it("shows the required validation message when no date is provided", async () => {
    const onSubmit = vi.fn();

    await renderWithProviders(<Harness defaultValue={null} onSubmit={onSubmit} />);

    await userEvent.click(page.getByRole("button", { name: /submit/i }));

    await expect.element(page.getByText(/this field is required/i)).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not coerce undefined/null into a date string when no value is set", async () => {
    const onSubmit = vi.fn();

    await renderWithProviders(<Harness defaultValue={null} required={false} onSubmit={onSubmit} />);

    await userEvent.click(page.getByRole("button", { name: /submit/i }));

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const submitted = onSubmit.mock.calls[0]![0] as FormShape;
    expect(submitted.dateOfBirth).toBeNull();
  });
});
