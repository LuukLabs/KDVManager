import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import TextField, { type TextFieldProps } from "@mui/material/TextField";
import { useTranslation } from "react-i18next";

export type FormTextFieldProps<T extends FieldValues> = Omit<
  TextFieldProps,
  "name" | "defaultValue" | "error"
> & {
  name: Path<T>;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
};

/**
 * MUI `TextField` bound to react-hook-form via `Controller`.
 * Replaces `TextFieldElement` from react-hook-form-mui.
 */
export const FormTextField = <T extends FieldValues>({
  name,
  rules,
  required,
  helperText,
  ...rest
}: FormTextFieldProps<T>) => {
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
          required={required}
          error={!!fieldState.error}
          helperText={fieldState.error?.message ?? helperText}
        />
      )}
    />
  );
};
