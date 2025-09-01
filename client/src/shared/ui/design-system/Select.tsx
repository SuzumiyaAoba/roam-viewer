import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "./utils";

const selectTriggerVariants = cva(
  "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-gray-300",
        error: "border-red-300 focus:ring-red-500",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        default: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect">,
    VariantProps<typeof selectTriggerVariants> {
  /**
   * The options to display in the select
   */
  options: SelectOption[];
  /**
   * The selected value
   */
  value?: string;
  /**
   * Callback when selection changes
   */
  onValueChange?: (value: string) => void;
  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string;
  /**
   * Whether the select is disabled
   */
  disabled?: boolean;
  /**
   * Whether the select is required
   */
  required?: boolean;
  /**
   * Name attribute for form handling
   */
  name?: string;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      className,
      variant,
      size,
      options,
      value,
      onValueChange,
      placeholder = "Select an option...",
      disabled = false,
      required = false,
      name,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || "");
    const selectRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const selectedOption = options.find((option) => option.value === selectedValue);

    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
      setSelectedValue(optionValue);
      setIsOpen(false);
      onValueChange?.(optionValue);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case "Enter":
        case "Space":
          event.preventDefault();
          setIsOpen(!isOpen);
          break;
        case "ArrowDown":
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            // Focus next option logic would go here
          }
          break;
        case "ArrowUp":
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            // Focus previous option logic would go here
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    };

    return (
      <div ref={selectRef} className="relative w-full" {...props}>
        <div
          ref={ref}
          className={cn(selectTriggerVariants({ variant, size }), className)}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          aria-required={required}
        >
          <span className={cn("block truncate", !selectedOption && "text-gray-500")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={cn(
              "h-4 w-4 transition-transform text-gray-400",
              isOpen && "transform rotate-180",
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <title>Dropdown arrow</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isOpen && (
          <ul
            ref={listRef}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative cursor-pointer select-none py-2 px-3 hover:bg-blue-50",
                  option.disabled && "cursor-not-allowed opacity-50",
                  selectedValue === option.value && "bg-blue-100 text-blue-900",
                )}
                role="option"
                onClick={() => !option.disabled && handleSelect(option.value)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !option.disabled) {
                    e.preventDefault();
                    handleSelect(option.value);
                  }
                }}
                aria-selected={selectedValue === option.value}
                aria-disabled={option.disabled}
                tabIndex={0}
              >
                <span className="block truncate">{option.label}</span>
                {selectedValue === option.value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <title>Selected</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </ul>
        )}

        {name && <input type="hidden" name={name} value={selectedValue} />}
      </div>
    );
  },
);
Select.displayName = "Select";

const SelectLabel = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, htmlFor, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("block text-sm font-medium text-gray-700 mb-1", className)}
      htmlFor={htmlFor}
      {...props}
    >
      {children}
    </label>
  ),
);
SelectLabel.displayName = "SelectLabel";

const SelectHelperText = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    error?: boolean;
  }
>(({ className, error, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("mt-1 text-xs", error ? "text-red-600" : "text-gray-500", className)}
    {...props}
  />
));
SelectHelperText.displayName = "SelectHelperText";

export { Select, SelectLabel, SelectHelperText, selectTriggerVariants };
