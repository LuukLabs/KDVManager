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
  label: string;
  disabled?: boolean;
};

export type FormSelectProps<T extends FieldValues> = Omit<
  TextFieldProps,
  "name" | "select" | "children" | "defaultValue" | "error"
> & {
  name: Path<T>;
  options: FormSelectOption[];
  rules?: Omit<
    RegisterOptions,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
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
