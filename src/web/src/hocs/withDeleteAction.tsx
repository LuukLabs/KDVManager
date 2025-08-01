import { forwardRef, useCallback, type MouseEvent } from "react";
import { useDeleteAction } from "../hooks/useDeleteAction";
import {
  type DeleteConfig,
  type DeleteMutation,
  type ButtonComponent,
  type ExtractComponentProps,
} from "../types/delete.types";

// Enhanced options with generic constraints
type WithDeleteActionOptions<
  TData = void,
  TError = unknown,
  TVariables extends Record<string, unknown> = { id: string },
> = {
  readonly mutation: DeleteMutation<TData, TError, TVariables>;
  readonly config: DeleteConfig;
};

// Type-safe HOC with proper ref forwarding
export const withDeleteAction =
  <
    TComponent extends ButtonComponent<any>,
    TData = void,
    TError = unknown,
    TVariables extends Record<string, unknown> = { id: string },
  >(
    WrappedComponent: TComponent,
  ) =>
  (options: WithDeleteActionOptions<TData, TError, TVariables>) => {
    type ComponentProps = ExtractComponentProps<TComponent>;

    type Props = Omit<ComponentProps, "onClick" | "aria-label"> & {
      onClick?: (event: MouseEvent<HTMLElement>) => void;
    };

    const WithDeleteActionComponent = forwardRef<any, Props>((props, ref) => {
      const { openConfirmation, isDeleting } = useDeleteAction(options);
      const { onClick } = props as Props;

      const handleDeleteClick = useCallback(
        (event: MouseEvent<HTMLElement>) => {
          event.preventDefault();
          event.stopPropagation();

          // Call original onClick if provided
          onClick?.(event);

          // Then open confirmation
          openConfirmation();
        },
        [openConfirmation, onClick],
      );

      const enhancedProps = {
        ...props,
        onClick: handleDeleteClick,
        disabled: (props as any).disabled ?? isDeleting,
        "aria-label": options.config.texts.ariaLabel,
        ref,
      } as ComponentProps;

      return <WrappedComponent {...enhancedProps} />;
    });

    WithDeleteActionComponent.displayName = `withDeleteAction(${
      WrappedComponent.displayName ?? WrappedComponent.name ?? "Component"
    })`;

    return WithDeleteActionComponent;
  };
