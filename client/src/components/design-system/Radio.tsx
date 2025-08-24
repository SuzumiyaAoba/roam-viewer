import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const radioVariants = cva(
  'peer h-4 w-4 rounded-full border border-gray-300 text-blue-600 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
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

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof radioVariants> {
  /**
   * The label text for the radio button
   */
  label?: string
  /**
   * Additional description text
   */
  description?: string
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, size, label, description, ...props }, ref) => {
    const radio = (
      <div className="relative">
        <input
          type="radio"
          ref={ref}
          className={cn(radioVariants({ size }), className)}
          {...props}
        />
        {props.checked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className={cn(
                'rounded-full bg-blue-600',
                size === 'sm' && 'h-1.5 w-1.5',
                size === 'default' && 'h-2 w-2',
                size === 'lg' && 'h-2.5 w-2.5'
              )}
            />
          </div>
        )}
      </div>
    )

    if (label || description) {
      return (
        <div className="flex items-start space-x-3">
          {radio}
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

    return radio
  }
)
Radio.displayName = 'Radio'

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The value of the selected radio button
   */
  value?: string
  /**
   * Callback when selection changes
   */
  onValueChange?: (value: string) => void
  /**
   * The name attribute for all radio buttons in the group
   */
  name?: string
  /**
   * Whether the radio group is disabled
   */
  disabled?: boolean
  /**
   * Whether the radio group is required
   */
  required?: boolean
  /**
   * The orientation of the radio group
   */
  orientation?: 'horizontal' | 'vertical'
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ 
    className,
    value,
    onValueChange,
    name,
    disabled,
    required,
    orientation = 'vertical',
    children,
    ...props 
  }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange?.(event.target.value)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'grid gap-2',
          orientation === 'horizontal' && 'grid-flow-col auto-cols-max',
          className
        )}
        role="radiogroup"
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child) && child.type === Radio) {
            return React.cloneElement(child, {
              ...child.props,
              name: name || child.props.name,
              checked: value === child.props.value,
              onChange: handleChange,
              disabled: disabled || child.props.disabled,
              required: required || child.props.required,
              id: child.props.id || `${name || 'radio'}-${index}`,
            })
          }
          return child
        })}
      </div>
    )
  }
)
RadioGroup.displayName = 'RadioGroup'

export { Radio, RadioGroup, radioVariants }