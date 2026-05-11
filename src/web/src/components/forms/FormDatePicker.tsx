import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import { DatePicker, type DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";

export type FormDatePickerProps<T extends FieldValues> = Omit<
  DatePickerProps,
  "value" | "onChange" | "name" | "defaultValue"
> & {
  name: Path<T>;
  required?: boolean;
  rules?: Omit<
    RegisterOptions,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
  helperText?: string;
  /**
   * Map between the form value (typically a string like "YYYY-MM-DD")
   * and the picker value (a Dayjs instance).
   */
  transform?: {
    input?: (value: unknown) => Dayjs | null;
    output?: (value: Dayjs | null) => unknown;
  };
};

const defaultInputTransform = (value: unknown): Dayjs | null => {
  if (value === null || value === undefined || value === "") return null;
  if (dayjs.isDayjs(value)) return value;
  return dayjs(value as string);
};

/**
 * MUI `DatePicker` bound to react-hook-form via `Controller`.
 * Replaces `DatePickerElement` from react-hook-form-mui.
 */
export const FormDatePicker = <T extends FieldValues>({
  name,
  required,
  rules,
  helperText,
  transform,
  slotProps,
  ...rest
}: FormDatePickerProps<T>) => {
  const { control } = useFormContext<T>();
  const { t } = useTranslation();

  const mergedRules: RegisterOptions<T, Path<T>> = { ...rules } as RegisterOptions<T, Path<T>>;
  if (required && !mergedRules.required) {
    mergedRules.required = t("This field is required", { ns: "common" });
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={mergedRules}
      render={({ field, fieldState }) => {
        const value = transform?.input
          ? transform.input(field.value)
          : defaultInputTransform(field.value);
        const existingTextField = (slotProps?.textField ?? {}) as Record<string, unknown>;
        return (
          <DatePicker
            {...rest}
            value={value}
            inputRef={field.ref}
            onChange={(next) => {
              field.onChange(transform?.output ? transform.output(next) : next);
            }}
            slotProps={{
              ...slotProps,
              textField: {
                ...existingTextField,
                error: !!fieldState.error,
                helperText:
                  fieldState.error?.message ??
                  helperText ??
                  (existingTextField.helperText as string | undefined),
                required,
                onBlur: field.onBlur,
              },
            }}
          />
        );
      }}
    />
  );
};
