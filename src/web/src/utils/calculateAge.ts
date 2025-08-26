import dayjs from "dayjs";

/**
 * Calculates the age in years given a birthdate string (YYYY-MM-DD or ISO format).
 * Returns undefined if input is invalid.
 */
export function calculateAge(dateOfBirth: string): number | undefined {
  if (!dateOfBirth) return undefined;
  const birth = dayjs(dateOfBirth);
  if (!birth.isValid()) return undefined;

  const age = dayjs().diff(birth, "year");
  return age >= 0 ? age : undefined;
}
