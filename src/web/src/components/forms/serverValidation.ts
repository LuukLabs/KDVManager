import { type FieldValues, type Path, type UseFormSetError } from "react-hook-form";
import { ApiError } from "@api/errors/types";

/**
 * Shape of a single validation error as returned by the APIs' 422
 * UnprocessableEntityResponse (`{ status, errors: [{ property, code, title }] }`).
 */
export type ServerValidationError = {
  property: string;
  code?: string;
  title: string;
};

const isServerValidationError = (value: unknown): value is ServerValidationError => {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.property === "string" && typeof candidate.title === "string";
};

/**
 * Extracts the validation error list from a failed mutation.
 *
 * The fetch mutator throws an {@link ApiError} whose `details` holds the 422
 * body's `errors` array; only errors classified as validation are considered
 * so other failures (conflict, server error) never masquerade as field
 * errors. A plain `{ errors: [...] }` body is accepted too so handlers keep
 * working if they receive the response shape directly.
 */
export const getServerValidationErrors = (error: unknown): ServerValidationError[] => {
  if (error instanceof ApiError) {
    if (error.type !== "validation" && error.status !== 422) return [];
    return Array.isArray(error.details) ? error.details.filter(isServerValidationError) : [];
  }
  const errors = (error as { errors?: unknown } | null | undefined)?.errors;
  return Array.isArray(errors) ? errors.filter(isServerValidationError) : [];
};

/* eslint-disable i18next/no-literal-string -- path syntax tokens, not user-facing text */
/**
 * Replicates System.Text.Json's camelCase naming policy: a leading run of
 * uppercase letters is lowered up to (not including) an uppercase letter that
 * starts a new word, so acronym properties resolve correctly ("CID" → "cid",
 * "CIDNumber" → "cidNumber", "GivenName" → "givenName").
 */
const camelCase = (segment: string): string => {
  const chars = [...segment];
  for (let i = 0; i < chars.length; i++) {
    if (i > 0 && i + 1 < chars.length && !/[A-Z]/.test(chars[i + 1]!)) break;
    if (!/[A-Z]/.test(chars[i]!)) break;
    chars[i] = chars[i]!.toLowerCase();
  }
  return chars.join("");
};

/**
 * The backend reports FluentValidation property names (`GivenName`,
 * `PhoneNumbers[0].Number`); form fields use camelCase react-hook-form paths
 * (`givenName`, `phoneNumbers.0.number`).
 */
const toFieldPath = (property: string): string =>
  property
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .map(camelCase)
    .join(".");
/* eslint-enable i18next/no-literal-string */

type ApplyServerValidationErrorsOptions = {
  /**
   * Field names the form actually renders (array fields match by prefix,
   * e.g. "phoneNumbers" covers "phoneNumbers.0.number"). When set, errors on
   * other properties don't count as handled, so the caller's generic
   * feedback still fires. Forms that render every command field can omit it.
   */
  fields?: string[];
};

/**
 * Maps server-side validation errors onto their form fields via `setError`.
 * Returns whether any field-level error was mapped, so callers can fall back
 * to a generic submit error message when the failure wasn't a field
 * validation problem (errors without a property name don't count — they'd be
 * invisible on the form).
 */
export const applyServerValidationErrors = <TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  { fields }: ApplyServerValidationErrorsOptions = {},
): boolean => {
  const fieldErrors = getServerValidationErrors(error)
    .filter(({ property }) => property)
    .map(({ property, title }) => ({ path: toFieldPath(property), title }))
    .filter(
      ({ path }) => !fields || fields.some((field) => path === field || path.startsWith(`${field}.`)),
    );
  fieldErrors.forEach(({ path, title }) => {
    setError(path as Path<TFieldValues>, { type: "server", message: title });
  });
  return fieldErrors.length > 0;
};
