import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Badge, badgeVariants } from './badge'

describe('Badge', () => {
  it('should render with default variant', () => {
    render(<Badge>Default Badge</Badge>)
    
    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass(
      'inline-flex', 'items-center', 'rounded-md', 'border', 
      'px-2.5', 'py-0.5', 'text-xs', 'font-semibold'
    )
  })

  it('should render all variants correctly', () => {
    const variants = ['default', 'secondary', 'destructive', 'outline'] as const
    
    variants.forEach((variant) => {
      const { rerender } = render(<Badge variant={variant}>Badge</Badge>)
      const badge = screen.getByText('Badge')
      
      switch (variant) {
        case 'default':
          expect(badge).toHaveClass(
            'border-transparent', 'bg-primary', 'text-primary-foreground', 'shadow'
          )
          break
        case 'secondary':
          expect(badge).toHaveClass(
            'border-transparent', 'bg-secondary', 'text-secondary-foreground'
          )
          break
        case 'destructive':
          expect(badge).toHaveClass(
            'border-transparent', 'bg-destructive', 'text-destructive-foreground', 'shadow'
          )
          break
        case 'outline':
          expect(badge).toHaveClass('text-foreground')
          break
      }
      
      rerender(<div />) // Clean up for next iteration
    })
  })

  it('should accept custom className', () => {
    render(<Badge className="custom-class">Badge</Badge>)
    
    const badge = screen.getByText('Badge')
    expect(badge).toHaveClass('custom-class')
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Badge onClick={handleClick}>Clickable Badge</Badge>)
    
    const badge = screen.getByText('Clickable Badge')
    fireEvent.click(badge)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should render children correctly', () => {
    render(
      <Badge>
        <span>Icon</span>
        <span>Text</span>
      </Badge>
    )
    
    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('should accept all standard div attributes', () => {
    render(
      <Badge
        id="test-badge"
        data-testid="badge"
        role="status"
        aria-label="Status badge"
        title="Badge title"
      >
        Badge
      </Badge>
    )

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('id', 'test-badge')
    expect(badge).toHaveAttribute('role', 'status')
    expect(badge).toHaveAttribute('aria-label', 'Status badge')
    expect(badge).toHaveAttribute('title', 'Badge title')
  })

  it('should handle focus events', () => {
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()
    
    render(
      <Badge
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
        data-testid="badge"
      >
        Focusable Badge
      </Badge>
    )

    const badge = screen.getByTestId('badge')
    
    fireEvent.focus(badge)
    expect(handleFocus).toHaveBeenCalledTimes(1)
    
    fireEvent.blur(badge)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('should have focus ring styling', () => {
    render(<Badge>Badge</Badge>)
    
    const badge = screen.getByText('Badge')
    expect(badge).toHaveClass(
      'focus:outline-none', 'focus:ring-2', 'focus:ring-ring', 'focus:ring-offset-2'
    )
  })

  it('should have transition colors', () => {
    render(<Badge>Badge</Badge>)
    
    const badge = screen.getByText('Badge')
    expect(badge).toHaveClass('transition-colors')
  })

  it('should handle keyboard events', () => {
    const handleKeyDown = vi.fn()
    render(
      <Badge tabIndex={0} onKeyDown={handleKeyDown} data-testid="badge">
        Badge
      </Badge>
    )

    const badge = screen.getByTestId('badge')
    fireEvent.keyDown(badge, { key: 'Enter' })
    
    expect(handleKeyDown).toHaveBeenCalledTimes(1)
  })

  it('should support custom styles', () => {
    render(
      <Badge style={{ backgroundColor: 'red', color: 'white' }} data-testid="badge">
        Custom Badge
      </Badge>
    )

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveStyle({
      backgroundColor: 'red',
      color: 'white'
    })
  })

  it('should render as a div element', () => {
    render(<Badge data-testid="badge">Badge</Badge>)
    
    const badge = screen.getByTestId('badge')
    expect(badge.tagName).toBe('DIV')
  })

  it('should handle hover effects based on variant', () => {
    const { rerender } = render(<Badge variant="default">Badge</Badge>)
    let badge = screen.getByText('Badge')
    expect(badge).toHaveClass('hover:bg-primary/80')

    rerender(<Badge variant="secondary">Badge</Badge>)
    badge = screen.getByText('Badge')
    expect(badge).toHaveClass('hover:bg-secondary/80')

    rerender(<Badge variant="destructive">Badge</Badge>)
    badge = screen.getByText('Badge')
    expect(badge).toHaveClass('hover:bg-destructive/80')
  })
})

describe('badgeVariants', () => {
  it('should generate correct classes for variants', () => {
    expect(badgeVariants({ variant: 'default' })).toContain('bg-primary')
    expect(badgeVariants({ variant: 'secondary' })).toContain('bg-secondary')
    expect(badgeVariants({ variant: 'destructive' })).toContain('bg-destructive')
    expect(badgeVariants({ variant: 'outline' })).toContain('text-foreground')
  })

  it('should use default variant when none specified', () => {
    const classes = badgeVariants()
    expect(classes).toContain('bg-primary')
  })

  it('should apply custom className', () => {
    const classes = badgeVariants({ className: 'custom-class' })
    expect(classes).toContain('custom-class')
  })
})