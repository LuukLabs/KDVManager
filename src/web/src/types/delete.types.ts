import { type UseMutationResult } from "@tanstack/react-query";
import { type MouseEvent, type ComponentType } from "react";

// Base delete texts with better type safety
export type DeleteTexts = {
  readonly confirmation: {
    readonly title: string;
    readonly message: string;
    readonly cancelButton: string;
    readonly deleteButton: string;
    readonly deletingButton: string;
  };
  readonly success: string;
  readonly errors: {
    readonly conflict: string;
    readonly notFound: string;
    readonly unknown: string;
  };
  readonly ariaLabel: string;
};

// Enhanced config with better type inference
export type DeleteConfig = {
  readonly id: string;
  readonly texts: DeleteTexts;
  readonly onSuccess?: () => void | Promise<void>;
  readonly onError?: (error: unknown) => void | Promise<void>;
};

// More flexible mutation type using existing TanStack types
export type DeleteMutation<
  TData = undefined | null,
  TError = unknown,
  TVariables extends Record<string, unknown> = { id: string },
> = UseMutationResult<TData, TError, TVariables>;

// Use existing React types for component props
export type ButtonComponentProps = {
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  "aria-label"?: string;
  children?: React.ReactNode;
  className?: string;
};

// Generic component props extractor using existing React utilities
export type ExtractComponentProps<T> = T extends ComponentType<infer P> ? P : never;

// Helper to ensure button components have required props
export type ButtonComponent<P = object> = ComponentType<P & ButtonComponentProps>;
