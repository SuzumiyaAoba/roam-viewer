import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "./utils";

const headerVariants = cva("w-full border-b bg-white transition-shadow duration-200", {
  variants: {
    variant: {
      default: "border-gray-200 shadow-sm",
      elevated: "border-gray-200 shadow-md",
      minimal: "border-gray-100",
      transparent: "border-transparent bg-transparent backdrop-blur-sm",
    },
    size: {
      sm: "h-12 px-4",
      default: "h-16 px-6",
      lg: "h-20 px-8",
    },
    position: {
      static: "relative",
      sticky: "sticky top-0 z-40",
      fixed: "fixed top-0 left-0 right-0 z-50",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    position: "static",
  },
});

export interface HeaderProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof headerVariants> {
  /**
   * Logo element or brand name
   */
  logo?: React.ReactNode;
  /**
   * Navigation items
   */
  navigation?: React.ReactNode;
  /**
   * Action buttons or user menu
   */
  actions?: React.ReactNode;
  /**
   * Whether to show mobile menu toggle
   */
  showMobileMenu?: boolean;
  /**
   * Callback when mobile menu is toggled
   */
  onMobileMenuToggle?: () => void;
  /**
   * Whether mobile menu is open
   */
  isMobileMenuOpen?: boolean;
}

const Header = forwardRef<HTMLElement, HeaderProps>(
  (
    {
      className,
      variant,
      size,
      position,
      logo,
      navigation,
      actions,
      showMobileMenu = true,
      onMobileMenuToggle,
      isMobileMenuOpen = false,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <header
        ref={ref}
        className={cn(headerVariants({ variant, size, position }), className)}
        {...props}
      >
        <div className="flex h-full items-center justify-between">
          {/* Left section - Logo */}
          <div className="flex items-center space-x-4">
            {logo && <div className="flex-shrink-0">{logo}</div>}
          </div>

          {/* Center section - Navigation (hidden on mobile) */}
          {navigation && <div className="hidden md:flex items-center space-x-1">{navigation}</div>}

          {/* Right section - Actions and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Desktop actions */}
            {actions && <div className="flex items-center space-x-2">{actions}</div>}

            {/* Mobile menu button */}
            {showMobileMenu && (
              <button
                onClick={onMobileMenuToggle}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle menu"
              >
                <svg
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isMobileMenuOpen && "rotate-90",
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && navigation && (
          <div
            className={cn(
              "md:hidden border-t border-gray-200 transition-all duration-200",
              isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden",
            )}
          >
            <div className="px-4 py-4 space-y-2">{navigation}</div>
          </div>
        )}

        {children}
      </header>
    );
  },
);
Header.displayName = "Header";

const HeaderLogo = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    href?: string;
    size?: "sm" | "default" | "lg";
  }
>(({ className, href, size = "default", children, ...props }, ref) => {
  const sizeClasses = {
    sm: "text-lg font-semibold",
    default: "text-xl font-bold",
    lg: "text-2xl font-bold",
  };

  if (href) {
    return (
      <a
        href={href}
        className={cn(
          "flex items-center text-gray-900 hover:text-gray-700 transition-colors",
          sizeClasses[size],
          className,
        )}
      >
        {children}
      </a>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center text-gray-900 hover:text-gray-700 transition-colors",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
HeaderLogo.displayName = "HeaderLogo";

const HeaderNav = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, children, ...props }, ref) => (
    <nav ref={ref} className={cn("flex items-center space-x-1", className)} {...props}>
      {children}
    </nav>
  ),
);
HeaderNav.displayName = "HeaderNav";

const HeaderNavItem = forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    active?: boolean;
    disabled?: boolean;
  }
>(({ className, active, disabled, children, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
      active ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
      disabled && "opacity-50 cursor-not-allowed pointer-events-none",
      className,
    )}
    aria-current={active ? "page" : undefined}
    {...props}
  >
    {children}
  </a>
));
HeaderNavItem.displayName = "HeaderNavItem";

const HeaderActions = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center space-x-2", className)} {...props}>
      {children}
    </div>
  ),
);
HeaderActions.displayName = "HeaderActions";

export { Header, HeaderLogo, HeaderNav, HeaderNavItem, HeaderActions, headerVariants };
