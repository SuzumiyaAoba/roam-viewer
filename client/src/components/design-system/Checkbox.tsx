import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white data-[state=checked]:border-blue-600',
  {
    variants: {
      size: {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxVariants> {
  /**
   * The label text for the checkbox
   */
  label?: string
  /**
   * Additional description text
   */
  description?: string
  /**
   * Whether the checkbox is in an indeterminate state
   */
  indeterminate?: boolean
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, size, label, description, indeterminate, ...props }, ref) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null)
    
    React.useImperativeHandle(ref, () => checkboxRef.current!)
    
    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = !!indeterminate
      }
    }, [indeterminate])

    const checkbox = (
      <div className="relative">
        <input
          type="checkbox"
          ref={checkboxRef}
          className={cn(checkboxVariants({ size }), className)}
          data-state={props.checked ? 'checked' : 'unchecked'}
          {...props}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {indeterminate ? (
            <svg
              className={cn(
                'text-white',
                size === 'sm' && 'h-2 w-2',
                size === 'default' && 'h-2.5 w-2.5', 
                size === 'lg' && 'h-3 w-3'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ) : props.checked ? (
            <svg
              className={cn(
                'text-white',
                size === 'sm' && 'h-2 w-2',
                size === 'default' && 'h-2.5 w-2.5',
                size === 'lg' && 'h-3 w-3'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : null}
        </div>
      </div>
    )

    if (label || description) {
      return (
        <div className="flex items-start space-x-3">
          {checkbox}
          <div className="grid gap-1.5 leading-none">
            {label && (
              <label
                htmlFor={props.id}
                className={cn(
                  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                  'cursor-pointer'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-gray-500">
                {description}
              </p>
            )}
          </div>
        </div>
      )
    }

    return checkbox
  }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox, checkboxVariants }