import dayjs from "dayjs";

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
