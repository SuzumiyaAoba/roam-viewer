import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ReactNode } from 'react'
import { TagDetailPage } from '../../client/src/pages/TagDetail'
import * as useNodesModule from '../../client/src/hooks/useNodes'

// Mock the hooks
vi.mock('../../client/src/hooks/useNodes')

// Mock react-router-dom params and navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ tag: 'react' }),
    useNavigate: () => vi.fn(),
  }
})

// Mock @iconify/react
vi.mock('@iconify/react', () => ({
  Icon: ({ icon, className, width, height }: any) => (
    <div 
      data-testid={`icon-${icon.split(':')[1]}`}
      className={className}
      style={{ width, height }}
    >
      {icon}
    </div>
  )
}))

// Mock NodeCard component
vi.mock('../../client/src/components/design-system/NodeCard', () => ({
  NodeCard: ({ title, file, tags, onCardClick, ...props }: any) => (
    <div 
      data-testid="node-card"
      onClick={onCardClick}
      {...props}
    >
      <h3>{title}</h3>
      <p>{file}</p>
      {tags && tags.map((tag: string, i: number) => (
        <span key={i} data-testid="node-tag">{tag}</span>
      ))}
    </div>
  )
}))

const mockUseNodesByTag = useNodesModule.useNodesByTag as any
const mockNavigate = vi.fn()

describe('TagDetailPage', () => {
  let queryClient: QueryClient
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element

  const mockNodes = [
    {
      id: 'node-1',
      title: 'React Fundamentals',
      file: 'react-fundamentals.md',
      tags: ['react', 'javascript', 'frontend'],
    },
    {
      id: 'node-2',
      title: 'React Hooks Guide',
      file: 'react-hooks.md',
      tags: ['react', 'hooks'],
    },
    {
      id: 'node-3',
      title: 'Advanced React Patterns',
      file: 'advanced-react.md',
      tags: ['react', 'advanced'],
    },
  ]

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    )

    // Default mock implementation
    mockUseNodesByTag.mockReturnValue({
      data: mockNodes,
      isLoading: false,
      error: null,
    })

    // Mock useNavigate
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        useParams: () => ({ tag: 'react' }),
        useNavigate: () => mockNavigate,
      }
    })

    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should show loading state', () => {
      mockUseNodesByTag.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      })

      render(<TagDetailPage />, { wrapper })

      expect(screen.getByText('Loading nodes...')).toBeInTheDocument()
      expect(screen.getByTestId('icon-loader-2')).toHaveClass('animate-spin')
      expect(screen.getByText('Tag: #react')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show error message when nodes fail to load', () => {
      mockUseNodesByTag.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load nodes'),
      })

      render(<TagDetailPage />, { wrapper })

      expect(screen.getByText(/error:/i)).toBeInTheDocument()
      expect(screen.getByText('Failed to load nodes for tag "#react".')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /back to tags/i })).toHaveAttribute('href', '/tags')
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no nodes found', () => {
      mockUseNodesByTag.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      })

      render(<TagDetailPage />, { wrapper })

      expect(screen.getByText('No nodes found with tag "#react"')).toBeInTheDocument()
      expect(screen.getByText('Create a new node and add the "#react" tag to see it here.')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /create node/i })).toHaveAttribute('href', '/nodes/new')
      expect(screen.getByRole('link', { name: /back to tags/i })).toHaveAttribute('href', '/tags')
    })

    it('should show empty state when nodes is null', () => {
      mockUseNodesByTag.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      })

      render(<TagDetailPage />, { wrapper })

      expect(screen.getByText('No nodes found with tag "#react"')).toBeInTheDocument()
    })
  })

  describe('Nodes Display', () => {
    it('should render all nodes for the tag', () => {
      render(<TagDetailPage />, { wrapper })

      expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
      expect(screen.getByText('React Hooks Guide')).toBeInTheDocument()
      expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument()
    })

    it('should show correct node count', () => {
      render(<TagDetailPage />, { wrapper })

      expect(screen.getByText('3 nodes tagged with #react')).toBeInTheDocument()
    })

    it('should show singular form for single node', () => {
      mockUseNodesByTag.mockReturnValue({
        data: [mockNodes[0]],
        isLoading: false,
        error: null,
      })

      render(<TagDetailPage />, { wrapper })

      expect(screen.getByText('1 node tagged with #react')).toBeInTheDocument()
      expect(screen.queryByText('1 nodes')).not.toBeInTheDocument()
    })

    it('should render nodes as NodeCard components', () => {
      render(<TagDetailPage />, { wrapper })

      const nodeCards = screen.getAllByTestId('node-card')
      expect(nodeCards).toHaveLength(3)
      
      // Check that each node's data is passed correctly
      expect(screen.getByText('react-fundamentals.md')).toBeInTheDocument()
      expect(screen.getByText('react-hooks.md')).toBeInTheDocument()
      expect(screen.getByText('advanced-react.md')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should render back to tags link', () => {
      render(<TagDetailPage />, { wrapper })

      const backLink = screen.getByRole('link', { name: /back to tags/i })
      expect(backLink).toHaveAttribute('href', '/tags')
      expect(screen.getByTestId('icon-arrow-left')).toBeInTheDocument()
    })

    it('should render view all nodes link', () => {
      render(<TagDetailPage />, { wrapper })

      const viewAllLink = screen.getByRole('link', { name: /view all nodes/i })
      expect(viewAllLink).toHaveAttribute('href', '/nodes?tag=react')
      expect(screen.getByTestId('icon-list')).toBeInTheDocument()
    })

    it('should render create node button', () => {
      render(<TagDetailPage />, { wrapper })

      const createLink = screen.getByRole('link', { name: /create node/i })
      expect(createLink).toHaveAttribute('href', '/nodes/new')
      expect(createLink).toHaveClass('bg-blue-600')
    })

    it('should handle node card clicks', () => {
      render(<TagDetailPage />, { wrapper })

      const nodeCards = screen.getAllByTestId('node-card')
      fireEvent.click(nodeCards[0])

      expect(mockNavigate).toHaveBeenCalledWith('/nodes/node-1')
    })

    it('should encode special characters in URLs', () => {
      // Mock a tag with special characters
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom')
        return {
          ...actual,
          useParams: () => ({ tag: 'tag with spaces' }),
          useNavigate: () => mockNavigate,
        }
      })

      render(<TagDetailPage />, { wrapper })

      const viewAllLink = screen.getByRole('link', { name: /view all nodes/i })
      expect(viewAllLink).toHaveAttribute('href', '/nodes?tag=tag%20with%20spaces')
    })
  })

  describe('Header Section', () => {
    it('should display tag name in title and header', () => {
      render(<TagDetailPage />, { wrapper })

      // Title in layout
      expect(screen.getByText('Tag: #react')).toBeInTheDocument()
      
      // Header display
      expect(screen.getByText('#react')).toBeInTheDocument()
    })

    it('should display tag icon', () => {
      render(<TagDetailPage />, { wrapper })

      expect(screen.getAllByTestId('icon-hash')).toHaveLength(2) // One in header, one in empty state icon area
    })

    it('should show proper action buttons', () => {
      render(<TagDetailPage />, { wrapper })

      expect(screen.getByRole('link', { name: /view all nodes/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /create node/i })).toBeInTheDocument()
      expect(screen.getByTestId('icon-list')).toBeInTheDocument()
      expect(screen.getByTestId('icon-plus')).toBeInTheDocument()
    })
  })

  describe('Grid Layout', () => {
    it('should use responsive grid layout', () => {
      const { container } = render(<TagDetailPage />, { wrapper })

      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toHaveClass('md:grid-cols-2', 'lg:grid-cols-3')
    })
  })

  describe('Hook Usage', () => {
    it('should call useNodesByTag with correct tag', () => {
      render(<TagDetailPage />, { wrapper })

      expect(mockUseNodesByTag).toHaveBeenCalledWith('react')
    })

    it('should handle tag parameter from URL', () => {
      // This is tested through the mock implementation
      render(<TagDetailPage />, { wrapper })

      expect(mockUseNodesByTag).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<TagDetailPage />, { wrapper })

      // Main title should be h1 (from Layout component)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tag: #react')
      
      // NodeCard titles should be h3 (from NodeCard mock)
      const cardTitles = screen.getAllByRole('heading', { level: 3 })
      expect(cardTitles).toHaveLength(3)
    })

    it('should have accessible link text', () => {
      render(<TagDetailPage />, { wrapper })

      expect(screen.getByRole('link', { name: /back to tags/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /view all nodes/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /create node/i })).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      render(<TagDetailPage />, { wrapper })

      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
      
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle tag with special characters', () => {
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom')
        return {
          ...actual,
          useParams: () => ({ tag: 'tag@with#symbols' }),
          useNavigate: () => mockNavigate,
        }
      })

      render(<TagDetailPage />, { wrapper })

      expect(screen.getByText('#tag@with#symbols')).toBeInTheDocument()
    })

    it('should handle undefined tag parameter', () => {
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom')
        return {
          ...actual,
          useParams: () => ({ tag: undefined }),
          useNavigate: () => mockNavigate,
        }
      })

      // Should not crash with undefined tag
      render(<TagDetailPage />, { wrapper })
      
      expect(mockUseNodesByTag).toHaveBeenCalledWith(undefined)
    })

    it('should handle very long tag names', () => {
      const longTag = 'a'.repeat(100)
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom')
        return {
          ...actual,
          useParams: () => ({ tag: longTag }),
          useNavigate: () => mockNavigate,
        }
      })

      render(<TagDetailPage />, { wrapper })

      expect(screen.getByText(`#${longTag}`)).toBeInTheDocument()
    })

    it('should handle empty tag parameter', () => {
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom')
        return {
          ...actual,
          useParams: () => ({ tag: '' }),
          useNavigate: () => mockNavigate,
        }
      })

      render(<TagDetailPage />, { wrapper })

      expect(screen.getByText('#')).toBeInTheDocument() // Just the hash symbol
    })
  })

  describe('Component State Management', () => {
    it('should handle data updates correctly', () => {
      const { rerender } = render(<TagDetailPage />, { wrapper })

      // Update the mock data
      mockUseNodesByTag.mockReturnValue({
        data: [mockNodes[0]],
        isLoading: false,
        error: null,
      })

      rerender(<TagDetailPage />)

      expect(screen.getByText('1 node tagged with #react')).toBeInTheDocument()
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
      expect(screen.queryByText('React Hooks Guide')).not.toBeInTheDocument()
    })
  })
})