import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button, buttonVariants } from '../../../client/src/components/ui/button'

describe('Button Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>)
      
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('should handle click events', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    })

    it('should support custom className', () => {
      render(<Button className="custom-class">Custom Button</Button>)
      
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })
  })

  describe('Button Variants', () => {
    it('should apply default variant styles', () => {
      render(<Button variant="default">Default</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('should apply destructive variant styles', () => {
      render(<Button variant="destructive">Delete</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')
    })

    it('should apply outline variant styles', () => {
      render(<Button variant="outline">Outline</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border', 'border-input', 'bg-background')
    })

    it('should apply secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')
    })

    it('should apply ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground')
    })

    it('should apply link variant styles', () => {
      render(<Button variant="link">Link</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-primary', 'underline-offset-4', 'hover:underline')
    })
  })

  describe('Button Sizes', () => {
    it('should apply default size styles', () => {
      render(<Button size="default">Default Size</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9', 'px-4', 'py-2')
    })

    it('should apply small size styles', () => {
      render(<Button size="sm">Small</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-8', 'px-3', 'text-xs')
    })

    it('should apply large size styles', () => {
      render(<Button size="lg">Large</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'px-8')
    })

    it('should apply icon size styles', () => {
      render(<Button size="icon">🔥</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9', 'w-9')
    })
  })

  describe('AsChild Functionality', () => {
    it('should render as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      
      // Should render as link, not button
      const link = screen.getByRole('link', { name: 'Link Button' })
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveClass('inline-flex', 'items-center', 'justify-center')
    })

    it('should apply button styles to child element', () => {
      render(
        <Button asChild variant="destructive" size="lg">
          <div>Custom Element</div>
        </Button>
      )
      
      const element = screen.getByText('Custom Element')
      expect(element).toHaveClass('bg-destructive', 'text-destructive-foreground', 'h-10', 'px-8')
    })
  })

  describe('Forward Ref', () => {
    it('should forward ref to button element', () => {
      let buttonRef: HTMLButtonElement | null = null
      
      render(<Button ref={(ref) => { buttonRef = ref }}>Ref Button</Button>)
      
      expect(buttonRef).toBeInstanceOf(HTMLButtonElement)
      expect(buttonRef?.textContent).toBe('Ref Button')
    })
  })

  describe('Accessibility', () => {
    it('should support aria attributes', () => {
      render(
        <Button 
          aria-label="Custom label"
          aria-disabled={true}
          aria-describedby="help-text"
        >
          Button
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Custom label')
      expect(button).toHaveAttribute('aria-disabled', 'true')
      expect(button).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('should have proper focus styles', () => {
      render(<Button>Focus me</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-1')
    })
  })

  describe('Button Variants Function', () => {
    it('should generate correct classes for variant combinations', () => {
      const defaultClasses = buttonVariants()
      expect(defaultClasses).toContain('bg-primary')
      expect(defaultClasses).toContain('h-9')

      const destructiveLarge = buttonVariants({ variant: 'destructive', size: 'lg' })
      expect(destructiveLarge).toContain('bg-destructive')
      expect(destructiveLarge).toContain('h-10')

      const ghostIcon = buttonVariants({ variant: 'ghost', size: 'icon' })
      expect(ghostIcon).toContain('hover:bg-accent')
      expect(ghostIcon).toContain('w-9')
    })

    it('should handle custom className with variants', () => {
      const customClasses = buttonVariants({ 
        variant: 'outline', 
        size: 'sm',
        className: 'my-custom-class'
      })
      expect(customClasses).toContain('border')
      expect(customClasses).toContain('h-8')
      expect(customClasses).toContain('my-custom-class')
    })
  })

  describe('HTML Button Attributes', () => {
    it('should support all button HTML attributes', () => {
      render(
        <Button 
          type="submit"
          form="my-form"
          name="submit-button"
          value="submit-value"
          title="Submit tooltip"
        >
          Submit
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
      expect(button).toHaveAttribute('form', 'my-form')
      expect(button).toHaveAttribute('name', 'submit-button')
      expect(button).toHaveAttribute('value', 'submit-value')
      expect(button).toHaveAttribute('title', 'Submit tooltip')
    })

    it('should support data attributes', () => {
      render(
        <Button 
          data-testid="test-button"
          data-action="save"
          data-custom="value"
        >
          Data Button
        </Button>
      )
      
      const button = screen.getByTestId('test-button')
      expect(button).toHaveAttribute('data-action', 'save')
      expect(button).toHaveAttribute('data-custom', 'value')
    })
  })

  describe('Event Handling', () => {
    it('should handle all mouse events', () => {
      const handlers = {
        onClick: vi.fn(),
        onMouseDown: vi.fn(),
        onMouseUp: vi.fn(),
        onMouseEnter: vi.fn(),
        onMouseLeave: vi.fn(),
      }

      render(<Button {...handlers}>Event Button</Button>)
      
      const button = screen.getByRole('button')
      
      fireEvent.click(button)
      fireEvent.mouseDown(button)
      fireEvent.mouseUp(button)
      fireEvent.mouseEnter(button)
      fireEvent.mouseLeave(button)

      expect(handlers.onClick).toHaveBeenCalledTimes(1)
      expect(handlers.onMouseDown).toHaveBeenCalledTimes(1)
      expect(handlers.onMouseUp).toHaveBeenCalledTimes(1)
      expect(handlers.onMouseEnter).toHaveBeenCalledTimes(1)
      expect(handlers.onMouseLeave).toHaveBeenCalledTimes(1)
    })

    it('should handle keyboard events', () => {
      const handleKeyDown = vi.fn()
      render(<Button onKeyDown={handleKeyDown}>Keyboard Button</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'Enter' })
      
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
    })
  })
})