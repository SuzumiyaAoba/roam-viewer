import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button, buttonVariants } from "./Button";

describe("Button", () => {
  it("should render with default variant and size", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("inline-flex", "items-center", "justify-center");
  });

  it("should render all variants correctly", () => {
    const variants = ["default", "destructive", "outline", "secondary", "ghost", "link"] as const;

    variants.forEach((variant) => {
      const { rerender } = render(<Button variant={variant}>Button</Button>);
      const button = screen.getByRole("button");

      // Check that the button has the expected classes based on variant
      switch (variant) {
        case "default":
          expect(button).toHaveClass("bg-primary", "text-primary-foreground");
          break;
        case "destructive":
          expect(button).toHaveClass("bg-destructive", "text-destructive-foreground");
          break;
        case "outline":
          expect(button).toHaveClass("border", "border-input", "bg-background");
          break;
        case "secondary":
          expect(button).toHaveClass("bg-secondary", "text-secondary-foreground");
          break;
        case "ghost":
          expect(button).toHaveClass("hover:bg-accent");
          break;
        case "link":
          expect(button).toHaveClass("text-primary", "underline-offset-4");
          break;
      }

      rerender(<div />); // Clean up for next iteration
    });
  });

  it("should render all sizes correctly", () => {
    const sizes = ["default", "sm", "lg", "icon"] as const;

    sizes.forEach((size) => {
      const { rerender } = render(<Button size={size}>Button</Button>);
      const button = screen.getByRole("button");

      switch (size) {
        case "default":
          expect(button).toHaveClass("h-9", "px-4", "py-2");
          break;
        case "sm":
          expect(button).toHaveClass("h-8", "px-3", "text-xs");
          break;
        case "lg":
          expect(button).toHaveClass("h-10", "px-8");
          break;
        case "icon":
          expect(button).toHaveClass("h-9", "w-9");
          break;
      }

      rerender(<div />); // Clean up for next iteration
    });
  });

  it("should handle click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:pointer-events-none", "disabled:opacity-50");
  });

  it("should not trigger click when disabled", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should accept custom className", () => {
    render(<Button className="custom-class">Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("should forward ref correctly", () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Button</Button>);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  it("should render as child component when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );

    // Should render as an anchor tag, not a button
    const link = screen.getByRole("link", { name: "Link Button" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
    expect(link).toHaveClass("inline-flex", "items-center", "justify-center");

    // Should not render a button element
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should handle keyboard events", () => {
    const handleKeyDown = vi.fn();
    render(<Button onKeyDown={handleKeyDown}>Button</Button>);

    const button = screen.getByRole("button");
    fireEvent.keyDown(button, { key: "Enter" });

    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it("should support focus events", () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();

    render(
      <Button onFocus={handleFocus} onBlur={handleBlur}>
        Button
      </Button>,
    );

    const button = screen.getByRole("button");

    fireEvent.focus(button);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    fireEvent.blur(button);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it("should have proper focus styles", () => {
    render(<Button>Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("focus-visible:outline-none", "focus-visible:ring-1");
  });

  it("should accept all standard button props", () => {
    render(
      <Button
        type="submit"
        form="test-form"
        name="test-button"
        value="test-value"
        aria-label="Test button"
        title="Test title"
      >
        Button
      </Button>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("form", "test-form");
    expect(button).toHaveAttribute("name", "test-button");
    expect(button).toHaveAttribute("value", "test-value");
    expect(button).toHaveAttribute("aria-label", "Test button");
    expect(button).toHaveAttribute("title", "Test title");
  });

  it("should render children correctly", () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>,
    );

    expect(screen.getByText("Icon")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
  });

  it("should have correct transition classes", () => {
    render(<Button>Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("transition-colors");
  });
});

describe("buttonVariants", () => {
  it("should generate correct classes for variant combinations", () => {
    expect(buttonVariants({ variant: "default", size: "sm" })).toContain("bg-primary");
    expect(buttonVariants({ variant: "default", size: "sm" })).toContain("h-8");
    expect(buttonVariants({ variant: "default", size: "sm" })).toContain("text-xs");
  });

  it("should use default variants when none specified", () => {
    const classes = buttonVariants();
    expect(classes).toContain("bg-primary"); // default variant
    expect(classes).toContain("h-9"); // default size
  });

  it("should apply custom className", () => {
    const classes = buttonVariants({ className: "custom-class" });
    expect(classes).toContain("custom-class");
  });
});
