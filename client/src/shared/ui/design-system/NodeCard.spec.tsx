import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NodeCard, NodeCardCompact, NodeCardGrid } from './NodeCard'

// Mock the Button component
vi.mock('./Button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  )
}))

// Mock the Badge component
vi.mock('./Badge', () => ({
  Badge: ({ children, onClick, className, variant, size }: any) => (
    <span 
      onClick={onClick} 
      className={className}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </span>
  )
}))

// Mock the utils
vi.mock('./utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('NodeCard', () => {
  const defaultProps = {
    title: 'Test Node',
    file: 'test-node.md',
    content: 'This is a test node content that is quite long and might need truncation.',
    tags: ['react', 'testing', 'vitest'],
  }

  it('should render with basic props', () => {
    render(<NodeCard {...defaultProps} />)

    expect(screen.getByText('Test Node')).toBeInTheDocument()
    expect(screen.getByText('test-node.md')).toBeInTheDocument()
    expect(screen.getByText(/This is a test node content/)).toBeInTheDocument()
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('testing')).toBeInTheDocument()
    expect(screen.getByText('vitest')).toBeInTheDocument()
  })

  it('should render all variants correctly', () => {
    const variants = ['default', 'elevated', 'minimal', 'accent', 'glass'] as const
    
    variants.forEach((variant) => {
      const { rerender } = render(<NodeCard {...defaultProps} variant={variant} />)
      const card = screen.getByText('Test Node').closest('div')
      
      expect(card).toHaveClass('group', 'relative', 'overflow-hidden', 'rounded-xl')
      
      rerender(<div />)
    })
  })

  it('should render all sizes correctly', () => {
    const sizes = ['sm', 'default', 'lg'] as const
    
    sizes.forEach((size) => {
      const { rerender } = render(<NodeCard {...defaultProps} size={size} />)
      const card = screen.getByText('Test Node').closest('div')
      
      switch (size) {
        case 'sm':
          expect(card).toHaveClass('p-4')
          break
        case 'default':
          expect(card).toHaveClass('p-6')
          break
        case 'lg':
          expect(card).toHaveClass('p-8')
          break
      }
      
      rerender(<div />)
    })
  })

  it('should handle card click events', () => {
    const handleCardClick = vi.fn()
    render(<NodeCard {...defaultProps} onCardClick={handleCardClick} />)

    const card = screen.getByText('Test Node').closest('div')
    fireEvent.click(card!)

    expect(handleCardClick).toHaveBeenCalledTimes(1)
  })

  it('should handle edit button click', () => {
    const handleEdit = vi.fn()
    render(<NodeCard {...defaultProps} onEdit={handleEdit} />)

    const editButton = screen.getByRole('button')
    fireEvent.click(editButton)

    expect(handleEdit).toHaveBeenCalledTimes(1)
  })

  it('should handle delete button click', () => {
    const handleDelete = vi.fn()
    render(<NodeCard {...defaultProps} onDelete={handleDelete} />)

    const buttons = screen.getAllByRole('button')
    const deleteButton = buttons.find(button => 
      button.className.includes('text-red-500')
    )
    
    fireEvent.click(deleteButton!)
    expect(handleDelete).toHaveBeenCalledTimes(1)
  })

  it('should handle tag clicks', () => {
    const handleTagClick = vi.fn()
    render(<NodeCard {...defaultProps} onTagClick={handleTagClick} />)

    const reactTag = screen.getByText('react')
    fireEvent.click(reactTag)

    expect(handleTagClick).toHaveBeenCalledWith('react')
  })

  it('should not trigger card click when clicking action buttons', () => {
    const handleCardClick = vi.fn()
    const handleEdit = vi.fn()
    
    render(
      <NodeCard 
        {...defaultProps} 
        onCardClick={handleCardClick}
        onEdit={handleEdit}
      />
    )

    const editButton = screen.getByRole('button')
    fireEvent.click(editButton)

    expect(handleEdit).toHaveBeenCalledTimes(1)
    expect(handleCardClick).not.toHaveBeenCalled()
  })

  it('should show selected state', () => {
    render(<NodeCard {...defaultProps} selected={true} />)

    const card = screen.getByText('Test Node').closest('div')
    expect(card).toHaveClass('ring-2', 'ring-blue-500', 'ring-offset-2')
    
    // Should show status indicator
    const statusIndicator = card?.querySelector('.w-3.h-3.bg-blue-500')
    expect(statusIndicator).toBeInTheDocument()
  })

  it('should truncate long content', () => {
    const longContent = 'A'.repeat(200) // Content longer than maxContentLength (150)
    render(<NodeCard {...defaultProps} content={longContent} />)

    const contentElement = screen.getByText(/A+\.\.\./)
    expect(contentElement).toBeInTheDocument()
    expect(contentElement.textContent).toHaveLength(153) // 150 chars + '...'
  })

  it('should limit displayed tags and show extra count', () => {
    const manyTags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7']
    render(<NodeCard {...defaultProps} tags={manyTags} maxTags={3} />)

    expect(screen.getByText('tag1')).toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
    expect(screen.getByText('tag3')).toBeInTheDocument()
    expect(screen.queryByText('tag4')).not.toBeInTheDocument()
    expect(screen.getByText('+4 more')).toBeInTheDocument()
  })

  it('should show TODO badge when todo prop is provided', () => {
    render(<NodeCard {...defaultProps} todo="Fix this bug" />)

    expect(screen.getByText('TODO: Fix this bug')).toBeInTheDocument()
  })

  it('should format and display date', () => {
    const testDate = '2024-01-15'
    render(<NodeCard {...defaultProps} date={testDate} />)

    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument()
  })

  it('should handle Date object for date prop', () => {
    const testDate = new Date('2024-01-15')
    render(<NodeCard {...defaultProps} date={testDate} />)

    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument()
  })

  it('should hide actions when showActions is false', () => {
    render(
      <NodeCard 
        {...defaultProps} 
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        showActions={false}
      />
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should render custom actions', () => {
    const customActions = <button data-testid="custom-action">Custom</button>
    render(<NodeCard {...defaultProps} actions={customActions} />)

    expect(screen.getByTestId('custom-action')).toBeInTheDocument()
  })

  it('should render children in footer', () => {
    render(
      <NodeCard {...defaultProps}>
        <span data-testid="custom-content">Custom footer content</span>
      </NodeCard>
    )

    expect(screen.getByTestId('custom-content')).toBeInTheDocument()
  })

  it('should handle missing optional props', () => {
    render(<NodeCard title="Minimal Node" />)

    expect(screen.getByText('Minimal Node')).toBeInTheDocument()
    expect(screen.queryByText(/\./)).not.toBeInTheDocument() // No file extension
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<NodeCard {...defaultProps} ref={ref} />)

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
  })

  it('should accept custom className', () => {
    render(<NodeCard {...defaultProps} className="custom-class" />)

    const card = screen.getByText('Test Node').closest('div')
    expect(card).toHaveClass('custom-class')
  })

  it('should handle interactive prop', () => {
    const { rerender } = render(<NodeCard {...defaultProps} interactive={true} />)
    let card = screen.getByText('Test Node').closest('div')
    expect(card).toHaveClass('hover:scale-[1.02]', 'hover:-translate-y-1')

    rerender(<NodeCard {...defaultProps} interactive={false} />)
    card = screen.getByText('Test Node').closest('div')
    expect(card).not.toHaveClass('hover:scale-[1.02]', 'hover:-translate-y-1')
  })
})

describe('NodeCardCompact', () => {
  const defaultProps = {
    title: 'Compact Node',
    file: 'compact.md',
    tags: ['compact', 'test']
  }

  it('should render with compact styling', () => {
    render(<NodeCardCompact {...defaultProps} />)

    expect(screen.getByText('Compact Node')).toBeInTheDocument()
    
    const card = screen.getByText('Compact Node').closest('div')
    expect(card).toHaveClass('py-3', 'px-4', 'hover:scale-100', 'hover:translate-y-0')
  })

  it('should use minimal variant and small size', () => {
    render(<NodeCardCompact {...defaultProps} />)

    const card = screen.getByText('Compact Node').closest('div')
    expect(card).toHaveClass('p-4') // small size
  })
})

describe('NodeCardGrid', () => {
  const defaultProps = {
    title: 'Grid Node',
    content: 'Grid node content'
  }

  it('should render with grid aspect ratio', () => {
    render(<NodeCardGrid {...defaultProps} />)

    expect(screen.getByText('Grid Node')).toBeInTheDocument()
    
    const card = screen.getByText('Grid Node').closest('div')
    expect(card).toHaveClass('aspect-[4/3]', 'flex', 'flex-col')
  })
})

describe('NodeCard Edge Cases', () => {
  it('should handle empty tags array', () => {
    render(<NodeCard title="No Tags" tags={[]} />)

    expect(screen.getByText('No Tags')).toBeInTheDocument()
    expect(screen.queryByText('+0 more')).not.toBeInTheDocument()
  })

  it('should handle maxTags being larger than tags array', () => {
    render(<NodeCard title="Few Tags" tags={['tag1', 'tag2']} maxTags={10} />)

    expect(screen.getByText('tag1')).toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
    expect(screen.queryByText('+0 more')).not.toBeInTheDocument()
  })

  it('should handle empty content', () => {
    render(<NodeCard title="No Content" content="" />)

    expect(screen.getByText('No Content')).toBeInTheDocument()
    expect(screen.queryByText('...')).not.toBeInTheDocument()
  })

  it('should handle content shorter than maxContentLength', () => {
    render(<NodeCard title="Short Content" content="Short" />)

    expect(screen.getByText('Short')).toBeInTheDocument()
    expect(screen.queryByText('...')).not.toBeInTheDocument()
  })
})