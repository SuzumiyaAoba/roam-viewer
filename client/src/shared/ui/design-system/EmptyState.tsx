import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { Button } from "./Button";
import { cn } from "./utils";

const emptyStateVariants = cva("flex flex-col items-center justify-center text-center", {
  variants: {
    variant: {
      default: "text-gray-500",
      muted: "text-gray-400",
      accent: "text-blue-600",
    },
    size: {
      sm: "py-8 px-4",
      default: "py-12 px-6",
      lg: "py-16 px-8",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  /**
   * Icon to display (can be emoji, SVG, or React component)
   */
  icon?: React.ReactNode;
  /**
   * Main title text
   */
  title: string;
  /**
   * Description text
   */
  description?: string;
  /**
   * Primary action button
   */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  /**
   * Custom illustration component
   */
  illustration?: React.ReactNode;
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      variant,
      size,
      icon,
      title,
      description,
      action,
      secondaryAction,
      illustration,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div ref={ref} className={cn(emptyStateVariants({ variant, size }), className)} {...props}>
        {/* Illustration or Icon */}
        {illustration ||
          (icon && (
            <div className="mb-6">
              {typeof icon === "string" ? (
                <div className="text-6xl opacity-50">{icon}</div>
              ) : (
                <div className="w-16 h-16 flex items-center justify-center text-gray-400">
                  {icon}
                </div>
              )}
            </div>
          ))}

        {/* Default illustration if none provided */}
        {!illustration && !icon && (
          <div className="mb-6">
            <svg
              className="w-16 h-16 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

        {/* Description */}
        {description && <p className="text-sm max-w-md mb-6">{description}</p>}

        {/* Custom content */}
        {children && <div className="mb-6">{children}</div>}

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3">
            {action && (
              <Button onClick={action.onClick} variant={action.variant || "default"}>
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || "outline"}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  },
);
EmptyState.displayName = "EmptyState";

// Predefined empty states for common scenarios
const EmptyStateNoResults = forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "icon" | "title" | "description"> & {
    searchQuery?: string;
  }
>(({ searchQuery, ...props }, ref) => (
  <EmptyState
    ref={ref}
    icon="🔍"
    title="No results found"
    description={
      searchQuery
        ? `No results found for "${searchQuery}". Try adjusting your search terms.`
        : "No results match your search criteria."
    }
    {...props}
  />
));
EmptyStateNoResults.displayName = "EmptyStateNoResults";

const EmptyStateNoNodes = forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "icon" | "title" | "description">
>((props, ref) => (
  <EmptyState
    ref={ref}
    icon="📝"
    title="No nodes yet"
    description="Get started by creating your first knowledge node. Organize your thoughts, ideas, and information in one place."
    action={{
      label: "Create First Node",
      onClick: () => {
        /* handled by parent */
      },
    }}
    {...props}
  />
));
EmptyStateNoNodes.displayName = "EmptyStateNoNodes";

const EmptyStateError = forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "icon" | "title"> & {
    error?: string;
  }
>(({ error, ...props }, ref) => (
  <EmptyState
    ref={ref}
    variant="muted"
    icon={
      <svg
        className="w-16 h-16"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <title>Warning triangle icon</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    }
    title="Something went wrong"
    description={error || "We encountered an error. Please try again later."}
    action={{
      label: "Try Again",
      onClick: () => window.location.reload(),
      variant: "outline",
    }}
    {...props}
  />
));
EmptyStateError.displayName = "EmptyStateError";

const EmptyStateLoading = forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "icon" | "title" | "description">
>((props, ref) => (
  <EmptyState
    ref={ref}
    variant="muted"
    icon={<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-400"></div>}
    title="Loading..."
    description="Please wait while we fetch your data."
    {...props}
  />
));
EmptyStateLoading.displayName = "EmptyStateLoading";

const EmptyStateOffline = forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "icon" | "title" | "description">
>((props, ref) => (
  <EmptyState
    ref={ref}
    icon={
      <svg
        className="w-16 h-16"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <title>Offline connection icon</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M18.364 5.636l-12.728 12.728m0 0L12 12m-6.364 6.364L12 12m6.364-6.364L12 12"
        />
      </svg>
    }
    title="You're offline"
    description="Check your internet connection and try again."
    action={{
      label: "Retry",
      onClick: () => window.location.reload(),
      variant: "outline",
    }}
    {...props}
  />
));
EmptyStateOffline.displayName = "EmptyStateOffline";

export {
  EmptyState,
  EmptyStateNoResults,
  EmptyStateNoNodes,
  EmptyStateError,
  EmptyStateLoading,
  EmptyStateOffline,
  emptyStateVariants,
};
