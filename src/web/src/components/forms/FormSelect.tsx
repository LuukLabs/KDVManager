import { type ReactNode } from "react";
import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import TextField, { type TextFieldProps } from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { useTranslation } from "react-i18next";

export type FormSelectOption = {
  id: string | number;
  /**
   * Rendered inside the `MenuItem`. `ReactNode` rather than `string` so an
   * option can carry decoration next to its text — e.g. an `aria-hidden`
   * group colour dot before the group name. The text itself must still come
   * from `t()`; keep the accessible name in the node.
   */
  label: ReactNode;
  disabled?: boolean;
};

export type FormSelectProps<T extends FieldValues> = Omit<
  TextFieldProps,
  "name" | "select" | "children" | "defaultValue" | "error"
> & {
  name: Path<T>;
  options: FormSelectOption[];
  rules?: Omit<RegisterOptions, "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled">;
};

/**
 * MUI `TextField` (with `select`) bound to react-hook-form via `Controller`.
 * Replaces `SelectElement` from react-hook-form-mui.
 */
export const FormSelect = <T extends FieldValues>({
  name,
  options,
  required,
  rules,
  helperText,
  onChange,
  ...rest
}: FormSelectProps<T>) => {
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
      render={({ field, fieldState }) => (
        <TextField
          {...rest}
          {...field}
          // Composed rather than overwritten by `field.onChange`, so a caller can
          // react to a *user-initiated* change. `reset()` and `setValue()` never
          // fire this, which is what lets a caller tell an edit apart from a
          // programmatic restore.
          onChange={(event) => {
            field.onChange(event);
            onChange?.(event);
          }}
          value={field.value ?? ""}
          inputRef={field.ref}
          select
          required={required}
          error={!!fieldState.error}
          helperText={fieldState.error?.message ?? helperText}
        >
          {options.map((opt) => (
            <MenuItem key={opt.id} value={opt.id} disabled={opt.disabled}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
};
