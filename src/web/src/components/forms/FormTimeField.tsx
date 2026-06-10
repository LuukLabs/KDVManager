import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import { TimeField, type TimeFieldProps } from "@mui/x-date-pickers/TimeField";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

export type FormTimeFieldProps<T extends FieldValues> = Omit<
  TimeFieldProps,
  "value" | "onChange" | "name" | "defaultValue"
> & {
  name: Path<T>;
  required?: boolean;
  rules?: Omit<RegisterOptions, "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled">;
  /** Format used for the displayed input. Default: "HH:mm". */
  displayFormat?: string;
  /** Format used to store the value in the form state. Default: "HH:mm:ss". */
  storeFormat?: string;
};

/**
 * MUI `TimeField` bound to react-hook-form via `Controller`.
 * Stores the value as a string (default: "HH:mm:ss").
 */
export const FormTimeField = <T extends FieldValues>({
  name,
  required,
  rules,
  displayFormat = "HH:mm",
  storeFormat = "HH:mm:ss",
  slotProps,
  ...rest
}: FormTimeFieldProps<T>) => {
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
        const value = field.value ? dayjs(field.value as string, storeFormat) : null;
        const existingTextField = (slotProps?.textField ?? {}) as Record<string, unknown>;
        return (
          <TimeField
            {...rest}
            value={value}
            inputRef={field.ref}
            format={rest.format ?? displayFormat}
            onChange={(next) => {
              field.onChange(next?.format(storeFormat) ?? null);
            }}
            slotProps={{
              ...slotProps,
              textField: {
                ...existingTextField,
                error: !!fieldState.error,
                helperText:
                  fieldState.error?.message ?? (existingTextField.helperText as string | undefined),
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
