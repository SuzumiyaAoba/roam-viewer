import { cva, type VariantProps } from 'class-variance-authority'
import type React from 'react'
import { forwardRef, useEffect, useRef } from 'react'
import { cn } from './utils'

const modalVariants = cva('relative bg-white rounded-lg shadow-xl transform transition-all', {
  variants: {
    size: {
      sm: 'max-w-sm w-full mx-4',
      default: 'max-w-md w-full mx-4',
      lg: 'max-w-lg w-full mx-4',
      xl: 'max-w-xl w-full mx-4',
      '2xl': 'max-w-2xl w-full mx-4',
      '3xl': 'max-w-3xl w-full mx-4',
      full: 'max-w-none w-full h-full m-0 rounded-none',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants> {
  /**
   * Whether the modal is open
   */
  open?: boolean
  /**
   * Callback fired when the modal should close
   */
  onClose?: () => void
  /**
   * Whether clicking the overlay should close the modal
   */
  closeOnOverlayClick?: boolean
  /**
   * Whether pressing escape should close the modal
   */
  closeOnEscape?: boolean
  /**
   * Whether to show the modal with animation
   */
  animated?: boolean
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      size,
      open = false,
      onClose,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      animated = true,
      children,
      ...props
    },
    ref
  ) => {
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEscape && onClose) {
          onClose()
        }
      }

      if (open) {
        document.addEventListener('keydown', handleEscape)
        document.body.style.overflow = 'hidden'
      }

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
      }
    }, [open, closeOnEscape, onClose])

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === overlayRef.current && closeOnOverlayClick && onClose) {
        onClose()
      }
    }

    if (!open) return null

    return (
      <div
        ref={overlayRef}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          'bg-black bg-opacity-50 backdrop-blur-sm',
          animated && 'animate-in fade-in-0 duration-300'
        )}
        onClick={handleOverlayClick}
      >
        <div
          ref={ref}
          className={cn(
            modalVariants({ size }),
            animated && 'animate-in zoom-in-95 fade-in-0 slide-in-from-bottom-2 duration-300',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    )
  }
)
Modal.displayName = 'Modal'

const ModalHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between p-6 pb-2', className)}
      {...props}
    >
      {children}
    </div>
  )
)
ModalHeader.displayName = 'ModalHeader'

const ModalTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight text-gray-900', className)}
      {...props}
    />
  )
)
ModalTitle.displayName = 'ModalTitle'

const ModalDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-gray-500 mt-1', className)} {...props} />
))
ModalDescription.displayName = 'ModalDescription'

const ModalCloseButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity',
      'hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
      'disabled:pointer-events-none data-[state=open]:bg-gray-100',
      className
    )}
    onClick={onClick}
    {...props}
  >
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
    <span className="sr-only">Close</span>
  </button>
))
ModalCloseButton.displayName = 'ModalCloseButton'

const ModalContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4', className)} {...props} />
  )
)
ModalContent.displayName = 'ModalContent'

const ModalFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-2',
        className
      )}
      {...props}
    />
  )
)
ModalFooter.displayName = 'ModalFooter'

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  modalVariants,
}
