import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from './card'

describe('Card', () => {
  it('should render with default styling', () => {
    render(<Card data-testid="card">Card content</Card>)
    
    const card = screen.getByTestId('card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass(
      'rounded-xl', 'border', 'bg-card', 'text-card-foreground', 'shadow'
    )
  })

  it('should accept custom className', () => {
    render(<Card className="custom-class" data-testid="card">Content</Card>)
    
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('custom-class')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<Card ref={ref}>Content</Card>)
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
  })

  it('should render children correctly', () => {
    render(
      <Card data-testid="card">
        <div>Child 1</div>
        <div>Child 2</div>
      </Card>
    )
    
    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
  })

  it('should accept all standard div attributes', () => {
    render(
      <Card
        id="test-card"
        role="article"
        aria-label="Test card"
        data-testid="card"
      >
        Content
      </Card>
    )

    const card = screen.getByTestId('card')
    expect(card).toHaveAttribute('id', 'test-card')
    expect(card).toHaveAttribute('role', 'article')
    expect(card).toHaveAttribute('aria-label', 'Test card')
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(
      <Card onClick={handleClick} data-testid="card">
        Clickable Card
      </Card>
    )

    const card = screen.getByTestId('card')
    fireEvent.click(card)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

describe('CardHeader', () => {
  it('should render with default styling', () => {
    render(<CardHeader data-testid="card-header">Header content</CardHeader>)
    
    const header = screen.getByTestId('card-header')
    expect(header).toBeInTheDocument()
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
  })

  it('should accept custom className', () => {
    render(<CardHeader className="custom-header" data-testid="card-header">Content</CardHeader>)
    
    const header = screen.getByTestId('card-header')
    expect(header).toHaveClass('custom-header')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<CardHeader ref={ref}>Header</CardHeader>)
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
  })
})

describe('CardTitle', () => {
  it('should render with default styling', () => {
    render(<CardTitle data-testid="card-title">Title Text</CardTitle>)
    
    const title = screen.getByTestId('card-title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('font-semibold', 'leading-none', 'tracking-tight')
  })

  it('should accept custom className', () => {
    render(<CardTitle className="custom-title" data-testid="card-title">Title</CardTitle>)
    
    const title = screen.getByTestId('card-title')
    expect(title).toHaveClass('custom-title')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<CardTitle ref={ref}>Title</CardTitle>)
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
  })
})

describe('CardDescription', () => {
  it('should render with default styling', () => {
    render(<CardDescription data-testid="card-description">Description text</CardDescription>)
    
    const description = screen.getByTestId('card-description')
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('text-sm', 'text-muted-foreground')
  })

  it('should accept custom className', () => {
    render(<CardDescription className="custom-desc" data-testid="card-description">Description</CardDescription>)
    
    const description = screen.getByTestId('card-description')
    expect(description).toHaveClass('custom-desc')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<CardDescription ref={ref}>Description</CardDescription>)
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
  })
})

describe('CardContent', () => {
  it('should render with default styling', () => {
    render(<CardContent data-testid="card-content">Content text</CardContent>)
    
    const content = screen.getByTestId('card-content')
    expect(content).toBeInTheDocument()
    expect(content).toHaveClass('p-6', 'pt-0')
  })

  it('should accept custom className', () => {
    render(<CardContent className="custom-content" data-testid="card-content">Content</CardContent>)
    
    const content = screen.getByTestId('card-content')
    expect(content).toHaveClass('custom-content')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<CardContent ref={ref}>Content</CardContent>)
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
  })
})

describe('CardFooter', () => {
  it('should render with default styling', () => {
    render(<CardFooter data-testid="card-footer">Footer content</CardFooter>)
    
    const footer = screen.getByTestId('card-footer')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
  })

  it('should accept custom className', () => {
    render(<CardFooter className="custom-footer" data-testid="card-footer">Footer</CardFooter>)
    
    const footer = screen.getByTestId('card-footer')
    expect(footer).toHaveClass('custom-footer')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<CardFooter ref={ref}>Footer</CardFooter>)
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
  })
})

describe('Card Composition', () => {
  it('should render complete card structure', () => {
    render(
      <Card data-testid="full-card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the card content area.</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Description')).toBeInTheDocument()
    expect(screen.getByText('This is the card content area.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()

    const card = screen.getByTestId('full-card')
    expect(card).toHaveClass('rounded-xl', 'border', 'bg-card', 'shadow')
  })

  it('should handle partial card structures', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title Only</CardTitle>
        </CardHeader>
        <CardContent>
          Content without footer
        </CardContent>
      </Card>
    )

    expect(screen.getByText('Title Only')).toBeInTheDocument()
    expect(screen.getByText('Content without footer')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should handle nested interactive elements', () => {
    const handleClick = vi.fn()
    
    render(
      <Card>
        <CardContent>
          <button onClick={handleClick}>Interactive Button</button>
        </CardContent>
      </Card>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should maintain semantic structure', () => {
    render(
      <Card role="article">
        <CardHeader>
          <CardTitle role="heading">Article Title</CardTitle>
          <CardDescription>Article subtitle</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Article content goes here.</p>
        </CardContent>
      </Card>
    )

    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('should handle custom styling on all components', () => {
    render(
      <Card className="custom-card" data-testid="styled-card">
        <CardHeader className="custom-header" data-testid="styled-header">
          <CardTitle className="custom-title" data-testid="styled-title">Title</CardTitle>
          <CardDescription className="custom-desc" data-testid="styled-desc">Description</CardDescription>
        </CardHeader>
        <CardContent className="custom-content" data-testid="styled-content">Content</CardContent>
        <CardFooter className="custom-footer" data-testid="styled-footer">Footer</CardFooter>
      </Card>
    )

    expect(screen.getByTestId('styled-card')).toHaveClass('custom-card')
    expect(screen.getByTestId('styled-header')).toHaveClass('custom-header')
    expect(screen.getByTestId('styled-title')).toHaveClass('custom-title')
    expect(screen.getByTestId('styled-desc')).toHaveClass('custom-desc')
    expect(screen.getByTestId('styled-content')).toHaveClass('custom-content')
    expect(screen.getByTestId('styled-footer')).toHaveClass('custom-footer')
  })
})