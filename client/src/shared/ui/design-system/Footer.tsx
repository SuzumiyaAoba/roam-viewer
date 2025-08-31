import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "./utils";

const footerVariants = cva("w-full bg-white border-t transition-colors duration-200", {
  variants: {
    variant: {
      default: "border-gray-200 bg-gray-50",
      minimal: "border-gray-100 bg-white",
      dark: "border-gray-700 bg-gray-900 text-white",
      accent: "border-blue-200 bg-blue-50",
    },
    size: {
      sm: "py-4 px-4",
      default: "py-6 px-6",
      lg: "py-8 px-8",
    },
    layout: {
      simple: "",
      multi: "",
      centered: "text-center",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    layout: "simple",
  },
});

export interface FooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof footerVariants> {
  /**
   * Main content sections
   */
  sections?: React.ReactNode;
  /**
   * Bottom content (copyright, legal links)
   */
  bottom?: React.ReactNode;
  /**
   * Social media links
   */
  social?: React.ReactNode;
  /**
   * Newsletter signup or CTA
   */
  cta?: React.ReactNode;
}

const Footer = forwardRef<HTMLDivElement, FooterProps>(
  (
    { className, variant, size, layout, sections, bottom, social, cta, children, ...props },
    ref,
  ) => {
    const hasMultipleSections = sections || social || cta || layout === "multi";

    return (
      <footer
        ref={ref}
        className={cn(footerVariants({ variant, size, layout }), className)}
        {...props}
      >
        <div className="max-w-6xl mx-auto">
          {hasMultipleSections && (
            <div
              className={cn(
                "grid gap-8",
                layout === "centered" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
              )}
            >
              {sections && (
                <div
                  className={cn(
                    layout === "centered" ? "col-span-1" : "col-span-1 md:col-span-2 lg:col-span-2",
                  )}
                >
                  {sections}
                </div>
              )}

              {social && (
                <div
                  className={cn(
                    layout === "centered" ? "col-span-1 flex justify-center" : "col-span-1",
                  )}
                >
                  {social}
                </div>
              )}

              {cta && (
                <div
                  className={cn(
                    layout === "centered" ? "col-span-1 flex justify-center" : "col-span-1",
                  )}
                >
                  {cta}
                </div>
              )}
            </div>
          )}

          {children}

          {bottom && (
            <div
              className={cn(
                "pt-6 mt-6 border-t",
                variant === "dark" ? "border-gray-700" : "border-gray-200",
                layout === "centered"
                  ? "text-center"
                  : "flex items-center justify-between flex-col sm:flex-row gap-4",
              )}
            >
              {bottom}
            </div>
          )}
        </div>
      </footer>
    );
  },
);
Footer.displayName = "Footer";

const FooterSection = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
  }
>(({ className, title, children, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-3", className)} {...props}>
    {title && (
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h3>
    )}
    <div className="space-y-2">{children}</div>
  </div>
));
FooterSection.displayName = "FooterSection";

const FooterLink = forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    external?: boolean;
  }
>(({ className, external, children, ...props }, ref) => (
  <a
    ref={ref}
    className={cn("text-sm text-gray-600 hover:text-gray-900 transition-colors block", className)}
    target={external ? "_blank" : undefined}
    rel={external ? "noopener noreferrer" : undefined}
    {...props}
  >
    {children}
  </a>
));
FooterLink.displayName = "FooterLink";

const FooterSocial = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
  }
>(({ className, title = "Follow Us", children, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-3", className)} {...props}>
    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h3>
    <div className="flex space-x-3">{children}</div>
  </div>
));
FooterSocial.displayName = "FooterSocial";

const FooterSocialLink = forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    platform?: string;
    icon?: React.ReactNode;
  }
>(({ className, platform, icon, children, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-900 transition-colors",
      className,
    )}
    target="_blank"
    rel="noopener noreferrer"
    {...(platform && { "aria-label": platform })}
    {...props}
  >
    {icon || children}
  </a>
));
FooterSocialLink.displayName = "FooterSocialLink";

const FooterBottom = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    copyright?: string;
    links?: React.ReactNode;
  }
>(({ className, copyright, links, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between flex-col sm:flex-row gap-4", className)}
    {...props}
  >
    <div className="text-sm text-gray-500">{copyright || children}</div>
    {links && <div className="flex space-x-6">{links}</div>}
  </div>
));
FooterBottom.displayName = "FooterBottom";

const FooterCTA = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
    description?: string;
    action?: React.ReactNode;
  }
>(({ className, title, description, action, children, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-3", className)} {...props}>
    {title && (
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h3>
    )}
    {description && <p className="text-sm text-gray-600">{description}</p>}
    {action && <div className="pt-2">{action}</div>}
    {children}
  </div>
));
FooterCTA.displayName = "FooterCTA";

export {
  Footer,
  FooterSection,
  FooterLink,
  FooterSocial,
  FooterSocialLink,
  FooterBottom,
  FooterCTA,
  footerVariants,
};
