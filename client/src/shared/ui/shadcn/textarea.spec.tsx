import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Textarea } from './textarea'

describe('Textarea', () => {
  it('should render with default styling', () => {
    render(<Textarea placeholder="Enter text" />)

    const textarea = screen.getByPlaceholderText('Enter text')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveClass(
      'flex',
      'min-h-[60px]',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-transparent',
      'px-3',
      'py-2',
      'text-base',
      'shadow-sm'
    )
  })

  it('should handle value and onChange', () => {
    const handleChange = vi.fn()
    render(<Textarea value="test value" onChange={handleChange} data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveValue('test value')

    fireEvent.change(textarea, { target: { value: 'new value' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('should handle multiline text', () => {
    const multilineText = 'Line 1\nLine 2\nLine 3'
    render(<Textarea value={multilineText} data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveValue(multilineText)
  })

  it('should handle disabled state', () => {
    render(<Textarea disabled data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toBeDisabled()
    expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('should handle required attribute', () => {
    render(<Textarea required data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toBeRequired()
  })

  it('should accept custom className', () => {
    render(<Textarea className="custom-class" data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass('custom-class')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<Textarea ref={ref} />)

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement))
  })

  it('should handle focus and blur events', () => {
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()

    render(<Textarea onFocus={handleFocus} onBlur={handleBlur} data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')

    fireEvent.focus(textarea)
    expect(handleFocus).toHaveBeenCalledTimes(1)

    fireEvent.blur(textarea)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('should have focus-visible styling', () => {
    render(<Textarea data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-1',
      'focus-visible:ring-ring'
    )
  })

  it('should handle placeholder styling', () => {
    render(<Textarea placeholder="Placeholder text" data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass('placeholder:text-muted-foreground')
    expect(textarea).toHaveAttribute('placeholder', 'Placeholder text')
  })

  it('should handle rows attribute', () => {
    render(<Textarea rows={10} data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('rows', '10')
  })

  it('should handle cols attribute', () => {
    render(<Textarea cols={50} data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('cols', '50')
  })

  it('should accept all standard textarea attributes', () => {
    render(
      <Textarea
        id="test-textarea"
        name="testName"
        maxLength={100}
        minLength={5}
        wrap="soft"
        data-testid="textarea"
      />
    )

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('id', 'test-textarea')
    expect(textarea).toHaveAttribute('name', 'testName')
    expect(textarea).toHaveAttribute('maxlength', '100')
    expect(textarea).toHaveAttribute('minlength', '5')
    expect(textarea).toHaveAttribute('wrap', 'soft')
  })

  it('should handle readonly state', () => {
    render(<Textarea readOnly value="readonly value" data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('readonly')
    expect(textarea).toHaveValue('readonly value')
  })

  it('should handle keyboard events', () => {
    const handleKeyDown = vi.fn()
    const handleKeyUp = vi.fn()

    render(<Textarea onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')

    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(handleKeyDown).toHaveBeenCalledTimes(1)

    fireEvent.keyUp(textarea, { key: 'Enter' })
    expect(handleKeyUp).toHaveBeenCalledTimes(1)
  })

  it('should handle resize behavior', () => {
    render(<Textarea style={{ resize: 'vertical' }} data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveStyle({ resize: 'vertical' })
  })

  it('should handle autoComplete', () => {
    render(<Textarea autoComplete="off" data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('autocomplete', 'off')
  })

  it('should have correct responsive text sizing', () => {
    render(<Textarea data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass('text-base', 'md:text-sm')
  })

  it('should have minimum height constraint', () => {
    render(<Textarea data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass('min-h-[60px]')
  })

  it('should handle spellCheck attribute', () => {
    render(<Textarea spellCheck={false} data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('spellcheck', 'false')
  })
})
