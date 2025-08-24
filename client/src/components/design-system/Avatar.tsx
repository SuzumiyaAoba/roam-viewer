import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full bg-gray-100',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        default: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
        '2xl': 'h-20 w-20',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  /**
   * The source URL of the avatar image
   */
  src?: string
  /**
   * Alternative text for the avatar image
   */
  alt?: string
  /**
   * Fallback content when image fails to load or src is not provided
   */
  fallback?: React.ReactNode
  /**
   * Name to generate initials from when fallback is not provided
   */
  name?: string
  /**
   * Show online status indicator
   */
  status?: 'online' | 'offline' | 'away' | 'busy'
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, name, status, ...props }, ref) => {
    const [imageLoaded, setImageLoaded] = React.useState(false)
    const [imageError, setImageError] = React.useState(false)

    const handleImageLoad = () => {
      setImageLoaded(true)
      setImageError(false)
    }

    const handleImageError = () => {
      setImageError(true)
      setImageLoaded(false)
    }

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    }

    const renderFallback = () => {
      if (fallback) return fallback
      if (name) return getInitials(name)
      return (
        <svg
          className="h-full w-full text-gray-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }

    const statusColors = {
      online: 'bg-green-400',
      offline: 'bg-gray-400',
      away: 'bg-yellow-400',
      busy: 'bg-red-400',
    }

    return (
      <div className="relative inline-block">
        <div
          ref={ref}
          className={cn(avatarVariants({ size }), className)}
          {...props}
        >
          {src && !imageError && (
            <img
              src={src}
              alt={alt || name || 'Avatar'}
              className={cn(
                'aspect-square h-full w-full object-cover',
                !imageLoaded && 'invisible'
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
          {(!src || imageError || !imageLoaded) && (
            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-600 bg-gray-100">
              {renderFallback()}
            </div>
          )}
        </div>
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
              statusColors[status],
              size === 'sm' && 'h-2.5 w-2.5',
              size === 'default' && 'h-3 w-3',
              size === 'lg' && 'h-3.5 w-3.5',
              size === 'xl' && 'h-4 w-4',
              size === '2xl' && 'h-5 w-5'
            )}
          />
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

const AvatarGroup = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    max?: number
    size?: VariantProps<typeof avatarVariants>['size']
  }
>(({ className, children, max, size = 'default', ...props }, ref) => {
  const childrenArray = React.Children.toArray(children)
  const visibleChildren = max ? childrenArray.slice(0, max) : childrenArray
  const hiddenCount = max ? Math.max(0, childrenArray.length - max) : 0

  return (
    <div
      ref={ref}
      className={cn('flex -space-x-2', className)}
      {...props}
    >
      {visibleChildren.map((child, index) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              ...child.props,
              size,
              className: cn(
                'ring-2 ring-white',
                child.props.className
              ),
              key: index,
            })
          : child
      )}
      {hiddenCount > 0 && (
        <Avatar
          size={size}
          fallback={`+${hiddenCount}`}
          className="ring-2 ring-white bg-gray-200 text-gray-600"
        />
      )}
    </div>
  )
})
AvatarGroup.displayName = 'AvatarGroup'

export { Avatar, AvatarGroup, avatarVariants }