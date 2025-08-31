// Shared UI Components Export

// Design System Components
export * from './design-system'

// Shadcn/UI Components (with aliases to avoid conflicts)
export {
  Button as ShadcnButton,
  type ButtonProps as ShadcnButtonProps,
  buttonVariants as shadcnButtonVariants
} from './shadcn/button'
export {
  Badge as ShadcnBadge,
  type BadgeProps as ShadcnBadgeProps,
  badgeVariants as shadcnBadgeVariants
} from './shadcn/badge'
export * from './shadcn/card'
export {
  Input as ShadcnInput,
  type InputProps as ShadcnInputProps
} from './shadcn/input'
export {
  Textarea as ShadcnTextarea,
  type TextareaProps as ShadcnTextareaProps
} from './shadcn/textarea'