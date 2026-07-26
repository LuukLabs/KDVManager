import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

// `LL`/`LLLL` come from the active dayjs locale, so Dutch renders "26 juli 2026"
// instead of the US "juli 26, 2026" that hand-written "MMMM D, YYYY" produces.
dayjs.extend(localizedFormat);

/**
 * A weekday and date for a page heading: "zondag 26 juli 2026".
 * @param locale an i18n language tag; falls back to the global dayjs locale
 */
export const formatDayHeading = (date: dayjs.Dayjs, locale?: string): string =>
  (locale ? date.locale(locale) : date).format("dddd LL");

/** A date without its weekday: "26 juli 2026". */
export const formatLongDate = (date: dayjs.Dayjs, locale?: string): string =>
  (locale ? date.locale(locale) : date).format("LL");

/**
 * Formats a date of birth to DD-MM-YYYY format using dayjs
 * @param dateOfBirth - The date string to format (ISO string or DateOnly)
 * @returns Formatted date string in DD-MM-YYYY format, or empty string if invalid
 */
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "";

  const date = dayjs(dateString);
  if (!date.isValid()) return "";

  return date.format("DD-MM-YYYY");
};
