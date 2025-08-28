import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { 
  NodeCard, 
  NodeCardCompact, 
  NodeCardGrid,
  nodeCardVariants 
} from '../../../client/src/components/design-system/NodeCard'

// Mock the Badge component to avoid dependency issues
vi.mock('../../../client/src/components/design-system/Badge', () => ({
  Badge: ({ children, className, onClick, ...props }: any) => (
    <span 
      className={`badge ${className || ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </span>
  )
}))

// Mock the Button component
vi.mock('../../../client/src/components/design-system/Button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button
      className={`btn ${className || ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}))

describe('NodeCard Component', () => {
  const defaultProps = {
    title: 'Test Node Title',
    content: 'This is test content for the node card component.',
    file: 'test-file.md',
    tags: ['tag1', 'tag2', 'programming'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render basic node card with title', () => {
      render(<NodeCard title="Test Title" />)
      
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('should render all provided props', () => {
      const props = {
        title: 'Node Title',
        content: 'Node content preview',
        file: 'node-file.md',
        tags: ['react', 'typescript'],
        todo: 'Fix the bug',
        date: '2024-01-15'
      }

      render(<NodeCard {...props} />)
      
      expect(screen.getByText('Node Title')).toBeInTheDocument()
      expect(screen.getByText('Node content preview')).toBeInTheDocument()
      expect(screen.getByText('node-file.md')).toBeInTheDocument()
      expect(screen.getByText('react')).toBeInTheDocument()
      expect(screen.getByText('typescript')).toBeInTheDocument()
      expect(screen.getByText(/TODO: Fix the bug/)).toBeInTheDocument()
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument()
    })

    it('should handle empty/missing optional props', () => {
      render(<NodeCard title="Minimal Node" />)
      
      expect(screen.getByText('Minimal Node')).toBeInTheDocument()
      expect(screen.queryByText(/TODO:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Jan/)).not.toBeInTheDocument()
    })
  })

  describe('Content Handling', () => {
    it('should truncate long content', () => {
      const longContent = 'A'.repeat(200) // 200 characters
      render(<NodeCard title="Long Content" content={longContent} />)
      
      const contentElement = screen.getByText(/A+\.\.\./)
      expect(contentElement.textContent).toContain('...')
      expect(contentElement.textContent?.length).toBeLessThan(200)
    })

    it('should respect maxContentLength prop', () => {
      const content = 'This is a test content that should be truncated'
      render(
        <NodeCard 
          title="Test" 
          content={content} 
          maxContentLength={20} 
        />
      )
      
      const contentText = screen.getByText(/This is a test conte\.\.\./)
      expect(contentText.textContent).toContain('...')
    })

    it('should not truncate short content', () => {
      const shortContent = 'Short content'
      render(<NodeCard title="Test" content={shortContent} />)
      
      expect(screen.getByText('Short content')).toBeInTheDocument()
      expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument()
    })
  })

  describe('Tag Handling', () => {
    it('should display all tags when under maxTags limit', () => {
      const tags = ['tag1', 'tag2', 'tag3']
      render(<NodeCard title="Test" tags={tags} />)
      
      tags.forEach(tag => {
        expect(screen.getByText(tag)).toBeInTheDocument()
      })
      expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument()
    })

    it('should limit tags and show "+X more" indicator', () => {
      const manyTags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7']
      render(<NodeCard title="Test" tags={manyTags} maxTags={3} />)
      
      expect(screen.getByText('tag1')).toBeInTheDocument()
      expect(screen.getByText('tag2')).toBeInTheDocument()
      expect(screen.getByText('tag3')).toBeInTheDocument()
      expect(screen.queryByText('tag4')).not.toBeInTheDocument()
      expect(screen.getByText('+4 more')).toBeInTheDocument()
    })

    it('should handle tag clicks', () => {
      const handleTagClick = vi.fn()
      render(
        <NodeCard 
          title="Test" 
          tags={['clickable']} 
          onTagClick={handleTagClick} 
        />
      )
      
      fireEvent.click(screen.getByText('clickable'))
      expect(handleTagClick).toHaveBeenCalledWith('clickable')
    })

    it('should not show tags section when no tags', () => {
      render(<NodeCard title="Test" tags={[]} />)
      
      // Should not render any tag elements
      expect(screen.queryByText('tag')).not.toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('should render edit and delete buttons when callbacks provided', () => {
      const handleEdit = vi.fn()
      const handleDelete = vi.fn()
      
      render(
        <NodeCard 
          title="Test" 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )
      
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })

    it('should handle edit button click', () => {
      const handleEdit = vi.fn()
      render(<NodeCard title="Test" onEdit={handleEdit} />)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleEdit).toHaveBeenCalledTimes(1)
    })

    it('should handle delete button click', () => {
      const handleDelete = vi.fn()
      render(<NodeCard title="Test" onDelete={handleDelete} />)
      
      fireEvent.click(screen.getAllByRole('button')[0]) // Delete button
      expect(handleDelete).toHaveBeenCalledTimes(1)
    })

    it('should render custom actions', () => {
      const customActions = <button data-testid="custom-action">Custom</button>
      render(<NodeCard title="Test" actions={customActions} />)
      
      expect(screen.getByTestId('custom-action')).toBeInTheDocument()
    })

    it('should hide actions when showActions is false', () => {
      render(
        <NodeCard 
          title="Test" 
          onEdit={() => {}} 
          onDelete={() => {}} 
          showActions={false} 
        />
      )
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should prevent action button clicks from triggering card click', () => {
      const handleCardClick = vi.fn()
      const handleEdit = vi.fn()
      
      render(
        <NodeCard 
          title="Test" 
          onCardClick={handleCardClick}
          onEdit={handleEdit}
        />
      )
      
      fireEvent.click(screen.getByRole('button'))
      
      expect(handleEdit).toHaveBeenCalledTimes(1)
      expect(handleCardClick).not.toHaveBeenCalled()
    })
  })

  describe('Click Handling', () => {
    it('should handle card click', () => {
      const handleCardClick = vi.fn()
      render(<NodeCard title="Test" onCardClick={handleCardClick} />)
      
      fireEvent.click(screen.getByText('Test'))
      expect(handleCardClick).toHaveBeenCalledTimes(1)
    })

    it('should not trigger card click when clicking action buttons', () => {
      const handleCardClick = vi.fn()
      const handleEdit = vi.fn()
      
      render(
        <NodeCard 
          title="Test" 
          onCardClick={handleCardClick}
          onEdit={handleEdit}
        />
      )
      
      // Click the edit button
      const editButton = screen.getByRole('button')
      fireEvent.click(editButton)
      
      expect(handleEdit).toHaveBeenCalledTimes(1)
      expect(handleCardClick).not.toHaveBeenCalled()
    })
  })

  describe('Selected State', () => {
    it('should show selected indicator when selected', () => {
      const { container } = render(<NodeCard title="Test" selected={true} />)
      
      // Should have ring classes and indicator
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('ring-2', 'ring-blue-500')
      
      // Should have status indicator
      const indicator = container.querySelector('.animate-pulse')
      expect(indicator).toBeInTheDocument()
    })

    it('should not show selected styles when not selected', () => {
      const { container } = render(<NodeCard title="Test" selected={false} />)
      
      const card = container.firstChild as HTMLElement
      expect(card).not.toHaveClass('ring-2')
      expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument()
    })
  })

  describe('Date Formatting', () => {
    it('should format string dates correctly', () => {
      render(<NodeCard title="Test" date="2024-01-15" />)
      
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument()
    })

    it('should format Date objects correctly', () => {
      const date = new Date('2024-12-25')
      render(<NodeCard title="Test" date={date} />)
      
      expect(screen.getByText('Dec 25, 2024')).toBeInTheDocument()
    })

    it('should not show date when not provided', () => {
      render(<NodeCard title="Test" />)
      
      expect(screen.queryByText(/\d{4}/)).not.toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('should apply variant classes', () => {
      const { container } = render(
        <NodeCard title="Test" variant="elevated" />
      )
      
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('shadow-md')
    })

    it('should apply size classes', () => {
      const { container } = render(
        <NodeCard title="Test" size="lg" />
      )
      
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('p-8')
    })

    it('should handle interactive prop', () => {
      const { container } = render(
        <NodeCard title="Test" interactive={false} />
      )
      
      const card = container.firstChild as HTMLElement
      expect(card).not.toHaveClass('hover:scale-[1.02]')
    })
  })

  describe('TODO Badge', () => {
    it('should render TODO badge when todo prop provided', () => {
      render(<NodeCard title="Test" todo="Complete feature" />)
      
      expect(screen.getByText(/TODO: Complete feature/)).toBeInTheDocument()
    })

    it('should not render TODO badge when todo not provided', () => {
      render(<NodeCard title="Test" />)
      
      expect(screen.queryByText(/TODO:/)).not.toBeInTheDocument()
    })
  })

  describe('Children Support', () => {
    it('should render children in footer area', () => {
      render(
        <NodeCard title="Test">
          <div data-testid="child-content">Child content</div>
        </NodeCard>
      )
      
      expect(screen.getByTestId('child-content')).toBeInTheDocument()
    })

    it('should show footer when children or date provided', () => {
      const { container } = render(
        <NodeCard title="Test" date="2024-01-01">
          <span>Footer content</span>
        </NodeCard>
      )
      
      const footer = container.querySelector('.border-t')
      expect(footer).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should support custom HTML attributes', () => {
      render(
        <NodeCard 
          title="Test" 
          data-testid="node-card"
          aria-label="Test node card"
          role="article"
        />
      )
      
      const card = screen.getByTestId('node-card')
      expect(card).toHaveAttribute('aria-label', 'Test node card')
      expect(card).toHaveAttribute('role', 'article')
    })

    it('should have proper heading hierarchy', () => {
      render(<NodeCard title="Test Node" />)
      
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Node')
    })
  })

  describe('Forward Ref', () => {
    it('should forward ref to div element', () => {
      let cardRef: HTMLDivElement | null = null
      
      render(<NodeCard ref={(ref) => { cardRef = ref }} title="Test" />)
      
      expect(cardRef).toBeInstanceOf(HTMLDivElement)
      expect(cardRef?.textContent).toContain('Test')
    })
  })
})

describe('NodeCard Variants', () => {
  describe('NodeCardCompact', () => {
    it('should render with compact styles', () => {
      const { container } = render(<NodeCardCompact title="Compact" />)
      
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('py-3', 'px-4')
    })

    it('should not have interactive transform effects', () => {
      const { container } = render(<NodeCardCompact title="Compact" />)
      
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('hover:scale-100', 'hover:translate-y-0')
    })
  })

  describe('NodeCardGrid', () => {
    it('should render with grid aspect ratio', () => {
      const { container } = render(<NodeCardGrid title="Grid" />)
      
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('aspect-[4/3]', 'flex', 'flex-col')
    })

    it('should forward props to base NodeCard', () => {
      render(<NodeCardGrid title="Grid Card" variant="elevated" />)
      
      expect(screen.getByText('Grid Card')).toBeInTheDocument()
    })
  })
})

describe('nodeCardVariants Function', () => {
  it('should generate correct classes for variant combinations', () => {
    const defaultClasses = nodeCardVariants()
    expect(defaultClasses).toContain('bg-white')
    expect(defaultClasses).toContain('p-6')

    const elevatedSmall = nodeCardVariants({ variant: 'elevated', size: 'sm' })
    expect(elevatedSmall).toContain('shadow-md')
    expect(elevatedSmall).toContain('p-4')

    const minimalNonInteractive = nodeCardVariants({ 
      variant: 'minimal', 
      interactive: false 
    })
    expect(minimalNonInteractive).toContain('bg-gray-50')
    expect(minimalNonInteractive).not.toContain('hover:scale-[1.02]')
  })

  it('should handle custom className with variants', () => {
    const customClasses = nodeCardVariants({ 
      variant: 'accent', 
      size: 'lg',
      className: 'my-custom-class'
    })
    expect(customClasses).toContain('from-blue-50')
    expect(customClasses).toContain('p-8')
    expect(customClasses).toContain('my-custom-class')
  })
})