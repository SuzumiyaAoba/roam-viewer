import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "./utils";

const spinnerVariants = cva("animate-spin rounded-full border-solid border-current", {
  variants: {
    size: {
      xs: "h-3 w-3 border",
      sm: "h-4 w-4 border",
      default: "h-5 w-5 border-2",
      lg: "h-6 w-6 border-2",
      xl: "h-8 w-8 border-2",
      "2xl": "h-12 w-12 border-4",
    },
    variant: {
      default: "border-gray-300 border-t-blue-600",
      primary: "border-blue-200 border-t-blue-600",
      secondary: "border-gray-200 border-t-gray-600",
      success: "border-green-200 border-t-green-600",
      warning: "border-yellow-200 border-t-yellow-600",
      destructive: "border-red-200 border-t-red-600",
      white: "border-white/30 border-t-white",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "default",
  },
});

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Accessible label for screen readers
   */
  label?: string;
}

const Spinner = forwardRef<HTMLOutputElement, SpinnerProps>(
  ({ className, size, variant, label = "Loading...", ...props }, ref) => {
    return (
      <output
        ref={ref}
        className={cn(spinnerVariants({ size, variant }), className)}
        aria-label={label}
        {...props}
      >
        <span className="sr-only">{label}</span>
      </output>
    );
  },
);
Spinner.displayName = "Spinner";

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to show the loading state
   */
  loading?: boolean;
  /**
   * The loading text to display
   */
  text?: string;
  /**
   * Size of the spinner
   */
  size?: VariantProps<typeof spinnerVariants>["size"];
  /**
   * Variant of the spinner
   */
  variant?: VariantProps<typeof spinnerVariants>["variant"];
  /**
   * Whether to show as overlay
   */
  overlay?: boolean;
}

const Loading = forwardRef<HTMLDivElement, LoadingProps>(
  (
    {
      className,
      loading = true,
      text = "Loading...",
      size = "default",
      variant = "default",
      overlay = false,
      children,
      ...props
    },
    ref,
  ) => {
    if (!loading && !children) return null;

    if (overlay) {
      return (
        <div className="relative">
          {children}
          {loading && (
            <div
              ref={ref}
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center",
                "bg-white/80 backdrop-blur-sm z-10",
                className,
              )}
              {...props}
            >
              <Spinner size={size} variant={variant} />
              {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
            </div>
          )}
        </div>
      );
    }

    if (loading) {
      return (
        <div
          ref={ref}
          className={cn("flex flex-col items-center justify-center p-4", className)}
          {...props}
        >
          <Spinner size={size} variant={variant} />
          {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
        </div>
      );
    }

    return <>{children}</>;
  },
);
Loading.displayName = "Loading";

const LoadingButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    loadingText?: string;
    spinnerSize?: VariantProps<typeof spinnerVariants>["size"];
    spinnerVariant?: VariantProps<typeof spinnerVariants>["variant"];
  }
>(
  (
    {
      className,
      loading = false,
      loadingText,
      spinnerSize = "sm",
      spinnerVariant = "white",
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center px-4 py-2",
          "bg-blue-600 text-white rounded-md hover:bg-blue-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          className,
        )}
        disabled={loading || disabled}
        {...props}
      >
        {loading && <Spinner size={spinnerSize} variant={spinnerVariant} className="mr-2" />}
        {loading ? loadingText || children : children}
      </button>
    );
  },
);
LoadingButton.displayName = "LoadingButton";

export { Spinner, Loading, LoadingButton, spinnerVariants };
