import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@api/errors/types";
import { applyServerValidationErrors, getServerValidationErrors } from "./serverValidation";

const validationErrors = [
  { property: "GivenName", code: "NotEmpty", title: "Given name is required" },
  { property: "PhoneNumbers[0].Number", code: "Invalid", title: "Invalid phone number" },
];

const validationApiError = (details: unknown) =>
  new ApiError({ message: "Unprocessable", status: 422, type: "validation", details });

describe("getServerValidationErrors", () => {
  it("extracts the errors array from a 422 ApiError's details (fetch mutator shape)", () => {
    expect(getServerValidationErrors(validationApiError(validationErrors))).toEqual(
      validationErrors,
    );
  });

  it("extracts errors from a plain UnprocessableEntityResponse body", () => {
    expect(getServerValidationErrors({ status: 422, errors: validationErrors })).toEqual(
      validationErrors,
    );
  });

  it("ignores errors-shaped payloads on non-validation ApiErrors", () => {
    const conflict = new ApiError({
      message: "Conflict",
      status: 409,
      type: "conflict",
      details: validationErrors,
    });
    expect(getServerValidationErrors(conflict)).toEqual([]);
  });

  it("returns an empty list for non-validation failures", () => {
    expect(
      getServerValidationErrors(new ApiError({ message: "Server error", status: 500 })),
    ).toEqual([]);
    expect(getServerValidationErrors(new Error("boom"))).toEqual([]);
    expect(getServerValidationErrors(undefined)).toEqual([]);
    expect(getServerValidationErrors(null)).toEqual([]);
  });
});

describe("applyServerValidationErrors", () => {
  it("maps PascalCase and indexed properties onto camelCase form field paths", () => {
    const setError = vi.fn();

    expect(applyServerValidationErrors(validationApiError(validationErrors), setError)).toBe(true);
    expect(setError).toHaveBeenCalledWith("givenName", {
      type: "server",
      message: "Given name is required",
    });
    expect(setError).toHaveBeenCalledWith("phoneNumbers.0.number", {
      type: "server",
      message: "Invalid phone number",
    });
  });

  it("camel-cases acronym properties the way the API's JSON naming policy does", () => {
    const setError = vi.fn();
    const error = validationApiError([{ property: "CID", code: "Invalid", title: "Invalid CID" }]);

    expect(applyServerValidationErrors(error, setError)).toBe(true);
    expect(setError).toHaveBeenCalledWith("cid", { type: "server", message: "Invalid CID" });
  });

  it("does not count command-level errors without a property name as handled", () => {
    const setError = vi.fn();
    const error = validationApiError([{ property: "", code: "Rule", title: "Cross-field rule" }]);

    expect(applyServerValidationErrors(error, setError)).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });

  it("only maps onto the given fields so errors elsewhere keep the generic fallback", () => {
    const setError = vi.fn();
    const error = validationApiError([
      { property: "Email", code: "Invalid", title: "Invalid email" },
    ]);
    const fields = ["givenName", "familyName"];

    expect(applyServerValidationErrors(error, setError, { fields })).toBe(false);
    expect(setError).not.toHaveBeenCalled();

    const phoneError = validationApiError([
      { property: "PhoneNumbers[1].Number", code: "Invalid", title: "Invalid phone number" },
    ]);
    expect(applyServerValidationErrors(phoneError, setError, { fields: ["phoneNumbers"] })).toBe(
      true,
    );
    expect(setError).toHaveBeenCalledWith("phoneNumbers.1.number", {
      type: "server",
      message: "Invalid phone number",
    });
  });

  it("returns false without touching the form when the error carries no validation list", () => {
    const setError = vi.fn();
    expect(applyServerValidationErrors(new Error("boom"), setError)).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });
});
