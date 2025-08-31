import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './input'

describe('Input', () => {
  it('should render with default styling', () => {
    render(<Input placeholder="Enter text" />)

    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass(
      'flex',
      'h-9',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-transparent',
      'px-3',
      'py-1',
      'text-base',
      'shadow-sm'
    )
  })

  it('should accept different input types', () => {
    const { rerender } = render(<Input type="text" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'text')

    rerender(<Input type="password" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password')

    rerender(<Input type="email" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email')

    rerender(<Input type="number" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'number')
  })

  it('should handle value and onChange', () => {
    const handleChange = vi.fn()
    render(<Input value="test value" onChange={handleChange} data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toHaveValue('test value')

    fireEvent.change(input, { target: { value: 'new value' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('should handle disabled state', () => {
    render(<Input disabled data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('should handle required attribute', () => {
    render(<Input required data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toBeRequired()
  })

  it('should accept custom className', () => {
    render(<Input className="custom-class" data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toHaveClass('custom-class')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<Input ref={ref} />)

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })

  it('should handle focus and blur events', () => {
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()

    render(<Input onFocus={handleFocus} onBlur={handleBlur} data-testid="input" />)

    const input = screen.getByTestId('input')

    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)

    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('should have focus-visible styling', () => {
    render(<Input data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-1',
      'focus-visible:ring-ring'
    )
  })

  it('should handle placeholder styling', () => {
    render(<Input placeholder="Placeholder text" data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toHaveClass('placeholder:text-muted-foreground')
    expect(input).toHaveAttribute('placeholder', 'Placeholder text')
  })

  it('should accept all standard input attributes', () => {
    render(
      <Input
        id="test-input"
        name="testName"
        autoComplete="off"
        maxLength={100}
        minLength={5}
        pattern="[A-Za-z]+"
        data-testid="input"
      />
    )

    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('id', 'test-input')
    expect(input).toHaveAttribute('name', 'testName')
    expect(input).toHaveAttribute('autocomplete', 'off')
    expect(input).toHaveAttribute('maxlength', '100')
    expect(input).toHaveAttribute('minlength', '5')
    expect(input).toHaveAttribute('pattern', '[A-Za-z]+')
  })

  it('should handle file input styling', () => {
    render(<Input type="file" data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toHaveClass(
      'file:border-0',
      'file:bg-transparent',
      'file:text-sm',
      'file:font-medium',
      'file:text-foreground'
    )
  })

  it('should handle readonly state', () => {
    render(<Input readOnly value="readonly value" data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('readonly')
    expect(input).toHaveValue('readonly value')
  })

  it('should handle keyboard events', () => {
    const handleKeyDown = vi.fn()
    const handleKeyUp = vi.fn()

    render(<Input onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} data-testid="input" />)

    const input = screen.getByTestId('input')

    fireEvent.keyDown(input, { key: 'Enter' })
    expect(handleKeyDown).toHaveBeenCalledTimes(1)

    fireEvent.keyUp(input, { key: 'Enter' })
    expect(handleKeyUp).toHaveBeenCalledTimes(1)
  })

  it('should have correct responsive text sizing', () => {
    render(<Input data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toHaveClass('text-base', 'md:text-sm')
  })
})
