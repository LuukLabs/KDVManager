import { type ReactNode } from "react";
import {
  FormProvider,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";

export type FormProps<T extends FieldValues> = {
  formContext: UseFormReturn<T>;
  onSubmit?: SubmitHandler<T>;
  children?: ReactNode;
  noValidate?: boolean;
  className?: string;
};

/**
 * Lightweight replacement for `react-hook-form-mui`'s `FormContainer`.
 *
 * - When `onSubmit` is provided, renders a `<form>` element with the submit
 *   handler wired through `formContext.handleSubmit`.
 * - When `onSubmit` is omitted, only provides the form context (useful for
 *   nested editable cards that share a single submit handler at the parent).
 */
export const Form = <T extends FieldValues>({
  formContext,
  onSubmit,
  children,
  noValidate = true,
  className,
}: FormProps<T>) => {
  if (!onSubmit) {
    return <FormProvider {...formContext}>{children}</FormProvider>;
  }
  return (
    <FormProvider {...formContext}>
      <form
        noValidate={noValidate}
        className={className}
        onSubmit={formContext.handleSubmit(onSubmit)}
      >
        {children}
      </form>
    </FormProvider>
  );
};
