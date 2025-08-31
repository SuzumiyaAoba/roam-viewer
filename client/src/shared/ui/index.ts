// Shared UI Components Export

// Design System Components
export * from './design-system'
export {
  Badge as ShadcnBadge,
  type BadgeProps as ShadcnBadgeProps,
  badgeVariants as shadcnBadgeVariants,
} from './shadcn/badge'
// Shadcn/UI Components (with aliases to avoid conflicts)
export {
  Button as ShadcnButton,
  type ButtonProps as ShadcnButtonProps,
  buttonVariants as shadcnButtonVariants,
} from './shadcn/button'
export * from './shadcn/card'
export { Input as ShadcnInput } from './shadcn/input'
export { Textarea as ShadcnTextarea } from './shadcn/textarea'
