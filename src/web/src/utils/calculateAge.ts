import dayjs from "dayjs";

/**
 * Calculates the age in years given a birthdate string (YYYY-MM-DD or ISO format).
 * Returns undefined if input is invalid.
 */
export function calculateAge(dateOfBirth: string): number | undefined {
  if (!dateOfBirth) return undefined;
  const birth = dayjs(dateOfBirth);
  if (!birth.isValid()) return undefined;
  const now = dayjs();
  let age = now.diff(birth, "year");
  // Adjust if birthday hasn't occurred yet this year
  if (
    now.month() < birth.month() ||
    (now.month() === birth.month() && now.date() < birth.date())
  ) {
    age -= 1;
  }
  return age >= 0 ? age : undefined;
}
