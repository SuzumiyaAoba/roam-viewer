import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
        destructive: 'border-transparent bg-red-600 text-white hover:bg-red-700',
        success: 'border-transparent bg-green-600 text-white hover:bg-green-700',
        warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
        outline: 'border-gray-300 text-gray-700 hover:bg-gray-50',
        ghost: 'border-transparent text-gray-600 hover:bg-gray-100',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * If true, adds a remove button to the badge
   */
  removable?: boolean
  /**
   * Callback when remove button is clicked
   */
  onRemove?: () => void
  /**
   * Icon to display at the start of the badge
   */
  startIcon?: React.ReactNode
  /**
   * Icon to display at the end of the badge
   */
  endIcon?: React.ReactNode
  /**
   * If true, adds a dot indicator at the start of the badge
   */
  dot?: boolean
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({
    className,
    variant,
    size,
    removable = false,
    onRemove,
    startIcon,
    endIcon,
    dot = false,
    children,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && (
          <span className="mr-1.5 h-2 w-2 rounded-full bg-current opacity-75" />
        )}
        {startIcon && (
          <span className="mr-1.5 h-3 w-3 flex items-center justify-center">
            {startIcon}
          </span>
        )}
        {children}
        {endIcon && (
          <span className="ml-1.5 h-3 w-3 flex items-center justify-center">
            {endIcon}
          </span>
        )}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1.5 h-3 w-3 rounded-full hover:bg-black/20 focus:outline-none focus:ring-1 focus:ring-white"
            aria-label="Remove badge"
          >
            <svg
              className="h-2.5 w-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge, badgeVariants }