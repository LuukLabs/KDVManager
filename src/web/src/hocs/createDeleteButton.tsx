import { forwardRef, useCallback, type MouseEvent } from "react";
import {
  type ButtonComponent,
  type DeleteConfig,
  type DeleteMutation,
  type ExtractComponentProps,
} from "../types/delete.types";
import { useDeleteAction } from "@hooks/useDeleteAction";

// Enhanced options with generic constraints
type WithDeleteActionOptions<
  TData = undefined | null,
  TError = unknown,
  TVariables extends Record<string, unknown> = { id: string },
> = {
  readonly mutation: DeleteMutation<TData, TError, TVariables>;
  readonly config: DeleteConfig;
};

// Factory function with improved ergonomics
export const createDeleteButton = <TComponent extends ButtonComponent<any>>(
  WrappedComponent: TComponent,
) => {
  type ComponentProps = ExtractComponentProps<TComponent>;

  const DeleteButton = forwardRef<
    any,
    ComponentProps &
      WithDeleteActionOptions & {
        buttonProps?: Partial<ComponentProps>;
      }
  >(({ mutation, config, buttonProps, ...props }, ref) => {
    const { openConfirmation, isDeleting } = useDeleteAction({ mutation, config });

    const handleDeleteClick = useCallback(
      (event: MouseEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();
        openConfirmation();
      },
      [openConfirmation],
    );

    const mergedProps = {
      ...buttonProps,
      ...props,
      onClick: handleDeleteClick,
      disabled: (props as any).disabled ?? (buttonProps as any)?.disabled ?? isDeleting,
      "aria-label": config.texts.ariaLabel,
      ref,
    } as ComponentProps;

    return <WrappedComponent {...mergedProps} />;
  });

  DeleteButton.displayName = `DeleteButton(${
    WrappedComponent.displayName ?? WrappedComponent.name ?? "Component"
  })`;

  return DeleteButton;
};
