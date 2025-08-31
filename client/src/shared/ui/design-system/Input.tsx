import { cva, type VariantProps } from 'class-variance-authority'
import type React from 'react'
import { forwardRef } from 'react'
import { Input as ShadcnInput } from '../shadcn/input'
import { cn } from './utils'

const inputVariants = cva(
  [
    'flex rounded-md border bg-white px-3 py-2 text-sm',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-gray-500',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-colors',
  ],
  {
    variants: {
      variant: {
        default: 'border-gray-300 hover:border-gray-400 focus:border-blue-500',
        error: 'border-red-500 focus:border-red-500 focus-visible:ring-red-500',
        success: 'border-green-500 focus:border-green-500 focus-visible:ring-green-500',
      },
      size: {
        sm: 'h-8 text-xs',
        default: 'h-10',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  helperText?: string
  errorMessage?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      helperText,
      errorMessage,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!errorMessage
    const finalVariant = hasError ? 'error' : variant

    return (
      <div className="flex flex-col space-y-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-900">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <ShadcnInput
            id={inputId}
            className={cn(
              inputVariants({ variant: finalVariant, size, className }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10'
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {hasError && errorMessage && (
          <span className="text-sm text-red-600" role="alert">
            {errorMessage}
          </span>
        )}
        {!hasError && helperText && <span className="text-sm text-gray-500">{helperText}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, inputVariants }
