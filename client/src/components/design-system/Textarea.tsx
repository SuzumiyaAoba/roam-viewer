import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea'

const textareaVariants = cva(
  'w-full rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y',
  {
    variants: {
      variant: {
        default: 'border border-gray-300 bg-white text-gray-900 placeholder-gray-500',
        filled: 'border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white',
        outlined: 'border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500',
        minimal: 'border-0 border-b-2 border-gray-200 rounded-none bg-transparent text-gray-900 placeholder-gray-500 focus:ring-0 focus:border-blue-500 resize-none',
        error: 'border border-red-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-red-500 focus:border-red-500',
        success: 'border border-green-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-green-500 focus:border-green-500',
      },
      size: {
        sm: 'px-3 py-2 text-sm min-h-[80px]',
        default: 'px-4 py-3 text-base min-h-[120px]',
        lg: 'px-5 py-4 text-lg min-h-[160px]',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      resize: 'vertical',
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  /**
   * Label for the textarea
   */
  label?: string
  /**
   * Helper text displayed below the textarea
   */
  helperText?: string
  /**
   * Error message displayed below the textarea
   */
  errorMessage?: string
  /**
   * Success message displayed below the textarea  
   */
  successMessage?: string
  /**
   * Character count display
   */
  showCharCount?: boolean
  /**
   * Maximum character limit
   */
  maxLength?: number
  /**
   * Auto-resize textarea based on content
   */
  autoResize?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    variant,
    size,
    resize,
    label,
    helperText,
    errorMessage,
    successMessage,
    showCharCount,
    maxLength,
    autoResize = false,
    id,
    value,
    onChange,
    ...props
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!errorMessage
    const hasSuccess = !!successMessage && !hasError
    
    const currentVariant = hasError ? 'error' : hasSuccess ? 'success' : variant
    const charCount = typeof value === 'string' ? value.length : 0
    const isOverLimit = maxLength && charCount > maxLength

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        const target = e.target
        target.style.height = 'auto'
        target.style.height = `${target.scrollHeight}px`
      }
      onChange?.(e)
    }

    React.useEffect(() => {
      if (autoResize && ref && typeof ref !== 'function') {
        const textarea = ref.current
        if (textarea) {
          textarea.style.height = 'auto'
          textarea.style.height = `${textarea.scrollHeight}px`
        }
      }
    }, [value, autoResize, ref])

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Textarea */}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            className={cn(
              textareaVariants({ variant: currentVariant, size, resize: autoResize ? 'none' : resize }),
              className
            )}
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />

          {/* Character count overlay */}
          {showCharCount && (maxLength || charCount > 0) && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/90 px-2 py-1 rounded">
              <span className={isOverLimit ? 'text-red-500' : ''}>
                {charCount}
              </span>
              {maxLength && (
                <>
                  <span>/</span>
                  <span>{maxLength}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Helper/Error/Success Messages */}
        {(helperText || errorMessage || successMessage) && (
          <div className="mt-2">
            {errorMessage && (
              <p className="text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errorMessage}
              </p>
            )}
            {!errorMessage && successMessage && (
              <p className="text-sm text-green-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMessage}
              </p>
            )}
            {!errorMessage && !successMessage && helperText && (
              <p className="text-sm text-gray-600">{helperText}</p>
            )}
          </div>
        )}

        {/* Character count below textarea */}
        {showCharCount && !errorMessage && !successMessage && (maxLength || charCount > 0) && (
          <div className="mt-1 text-right">
            <span className={cn(
              "text-xs",
              isOverLimit ? 'text-red-500' : 'text-gray-400'
            )}>
              {charCount}
              {maxLength && (
                <>
                  <span>/</span>
                  <span>{maxLength}</span>
                </>
              )}
            </span>
          </div>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// Auto-resizing textarea variant
const AutoTextarea = forwardRef<HTMLTextAreaElement, Omit<TextareaProps, 'autoResize' | 'resize'>>(
  (props, ref) => (
    <Textarea
      ref={ref}
      autoResize
      resize="none"
      {...props}
    />
  )
)
AutoTextarea.displayName = 'AutoTextarea'

// Minimal textarea for inline editing
const InlineTextarea = forwardRef<HTMLTextAreaElement, Omit<TextareaProps, 'variant' | 'label'>>(
  ({ className, ...props }, ref) => (
    <Textarea
      ref={ref}
      variant="minimal"
      className={cn('min-h-[32px] py-1', className)}
      {...props}
    />
  )
)
InlineTextarea.displayName = 'InlineTextarea'

export {
  Textarea,
  AutoTextarea,
  InlineTextarea,
  textareaVariants,
}