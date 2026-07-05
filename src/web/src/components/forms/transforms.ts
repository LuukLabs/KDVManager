import { type Dayjs } from "dayjs";

/** Standard FormDatePicker transform for date-only fields: stores "YYYY-MM-DD" strings. */
export const isoDateTransform = {
  output: (value: Dayjs | null) => (value ? value.format("YYYY-MM-DD") : null),
};
