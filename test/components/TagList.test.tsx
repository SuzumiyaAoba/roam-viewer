import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ReactNode } from 'react'
import { TagListPage } from '../../client/src/pages/TagList'
import * as useNodesModule from '../../client/src/hooks/useNodes'

// Mock the hooks
vi.mock('../../client/src/hooks/useNodes')

// Mock @iconify/react to avoid rendering issues
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

const mockUseTags = useNodesModule.useTags as any

describe('TagListPage', () => {
  let queryClient: QueryClient
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element

  const mockTags = [
    { tag: 'react', count: 10 },
    { tag: 'javascript', count: 15 },
    { tag: 'typescript', count: 8 },
    { tag: 'testing', count: 5 },
    { tag: 'design', count: 3 },
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
    mockUseTags.mockReturnValue({
      data: mockTags,
      isLoading: false,
      error: null,
    })

    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should show loading state', () => {
      mockUseTags.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      })

      render(<TagListPage />, { wrapper })

      expect(screen.getByText('Loading tags...')).toBeInTheDocument()
      expect(screen.getByTestId('icon-loader-2')).toHaveClass('animate-spin')
    })
  })

  describe('Error State', () => {
    it('should show error message when tags fail to load', () => {
      mockUseTags.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load tags'),
      })

      render(<TagListPage />, { wrapper })

      expect(screen.getByText(/error:/i)).toBeInTheDocument()
      expect(screen.getByText('Failed to load tags.')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no tags', () => {
      mockUseTags.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      })

      render(<TagListPage />, { wrapper })

      expect(screen.getByText('No tags found')).toBeInTheDocument()
      expect(screen.getByText('Tags will appear here once you add them to your nodes.')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /create node/i })).toHaveAttribute('href', '/nodes/new')
    })

    it('should show empty state when tags is null', () => {
      mockUseTags.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      })

      render(<TagListPage />, { wrapper })

      expect(screen.getByText('No tags found')).toBeInTheDocument()
    })
  })

  describe('Tag List Display', () => {
    it('should render all tags from the API', () => {
      render(<TagListPage />, { wrapper })

      expect(screen.getByText('Tags')).toBeInTheDocument()
      expect(screen.getByText('#react')).toBeInTheDocument()
      expect(screen.getByText('#javascript')).toBeInTheDocument()
      expect(screen.getByText('#typescript')).toBeInTheDocument()
      expect(screen.getByText('#testing')).toBeInTheDocument()
      expect(screen.getByText('#design')).toBeInTheDocument()
    })

    it('should display correct node counts', () => {
      render(<TagListPage />, { wrapper })

      expect(screen.getByText('10 nodes')).toBeInTheDocument()
      expect(screen.getByText('15 nodes')).toBeInTheDocument()
      expect(screen.getByText('8 nodes')).toBeInTheDocument()
      expect(screen.getByText('5 nodes')).toBeInTheDocument()
      expect(screen.getByText('3 nodes')).toBeInTheDocument()
    })

    it('should display singular form for single node', () => {
      mockUseTags.mockReturnValue({
        data: [{ tag: 'single', count: 1 }],
        isLoading: false,
        error: null,
      })

      render(<TagListPage />, { wrapper })

      expect(screen.getByText('1 node')).toBeInTheDocument()
      expect(screen.queryByText('1 nodes')).not.toBeInTheDocument()
    })

    it('should show total tag count in header', () => {
      render(<TagListPage />, { wrapper })

      expect(screen.getByText('Browse 5 tags across your knowledge base')).toBeInTheDocument()
    })

    it('should handle singular form in header count', () => {
      mockUseTags.mockReturnValue({
        data: [{ tag: 'single', count: 1 }],
        isLoading: false,
        error: null,
      })

      render(<TagListPage />, { wrapper })

      expect(screen.getByText('Browse 1 tag across your knowledge base')).toBeInTheDocument()
    })
  })

  describe('Tag Navigation Links', () => {
    it('should have correct links to tag detail pages', () => {
      render(<TagListPage />, { wrapper })

      // Each tag should have a main link to its detail page
      expect(screen.getByRole('link', { name: /react/i })).toHaveAttribute('href', '/tags/react')
      expect(screen.getByRole('link', { name: /javascript/i })).toHaveAttribute('href', '/tags/javascript')
    })

    it('should have filter links to node list with tag filter', () => {
      render(<TagListPage />, { wrapper })

      const filterLinks = screen.getAllByText('Filter nodes')
      expect(filterLinks[0].closest('a')).toHaveAttribute('href', '/nodes?tag=react')
      expect(filterLinks[1].closest('a')).toHaveAttribute('href', '/nodes?tag=javascript')
    })

    it('should have view details links', () => {
      render(<TagListPage />, { wrapper })

      const viewDetailsLinks = screen.getAllByText('View details →')
      expect(viewDetailsLinks[0].closest('a')).toHaveAttribute('href', '/tags/react')
      expect(viewDetailsLinks[1].closest('a')).toHaveAttribute('href', '/tags/javascript')
    })

    it('should properly encode special characters in tag names', () => {
      mockUseTags.mockReturnValue({
        data: [
          { tag: 'tag with spaces', count: 2 },
          { tag: 'tag/with/slashes', count: 1 },
          { tag: 'tag@with#symbols', count: 3 },
        ],
        isLoading: false,
        error: null,
      })

      render(<TagListPage />, { wrapper })

      expect(screen.getByText('#tag with spaces')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /tag with spaces/i }))
        .toHaveAttribute('href', '/tags/tag%20with%20spaces')
      
      const filterLink = screen.getAllByText('Filter nodes')[0].closest('a')
      expect(filterLink).toHaveAttribute('href', '/nodes?tag=tag%20with%20spaces')
    })
  })

  describe('Create Node Button', () => {
    it('should render create node button in header', () => {
      render(<TagListPage />, { wrapper })

      const createButtons = screen.getAllByRole('link', { name: /create node/i })
      expect(createButtons[0]).toHaveAttribute('href', '/nodes/new')
      expect(createButtons[0]).toHaveClass('bg-blue-600')
    })

    it('should render create node button in empty state', () => {
      mockUseTags.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      })

      render(<TagListPage />, { wrapper })

      expect(screen.getByRole('link', { name: /create node/i })).toHaveAttribute('href', '/nodes/new')
    })
  })

  describe('UI Components', () => {
    it('should render proper icons', () => {
      render(<TagListPage />, { wrapper })

      // Should have hash icons for each tag
      const hashIcons = screen.getAllByTestId('icon-hash')
      expect(hashIcons).toHaveLength(5) // One for each tag
      
      // Should have chevron right icons for navigation
      const chevronIcons = screen.getAllByTestId('icon-chevron-right')
      expect(chevronIcons).toHaveLength(5)

      // Should have filter icons
      const filterIcons = screen.getAllByTestId('icon-filter')
      expect(filterIcons).toHaveLength(5)
    })

    it('should have proper CSS classes for responsive layout', () => {
      const { container } = render(<TagListPage />, { wrapper })

      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toHaveClass('md:grid-cols-2', 'lg:grid-cols-3')
    })

    it('should apply hover effects to tag cards', () => {
      const { container } = render(<TagListPage />, { wrapper })

      const tagCards = container.querySelectorAll('.hover\\:shadow-md')
      expect(tagCards.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<TagListPage />, { wrapper })

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tags')
      
      // Each tag should have an h3 heading
      const tagHeadings = screen.getAllByRole('heading', { level: 3 })
      expect(tagHeadings).toHaveLength(5)
    })

    it('should have accessible link text', () => {
      render(<TagListPage />, { wrapper })

      // Links should have descriptive text
      expect(screen.getByRole('link', { name: /create node/i })).toBeInTheDocument()
      expect(screen.getAllByText('Filter nodes')).toHaveLength(5)
      expect(screen.getAllByText('View details →')).toHaveLength(5)
    })

    it('should support keyboard navigation', () => {
      render(<TagListPage />, { wrapper })

      // All interactive elements should be focusable links or buttons
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
      
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long tag names', () => {
      mockUseTags.mockReturnValue({
        data: [{ tag: 'a'.repeat(100), count: 1 }],
        isLoading: false,
        error: null,
      })

      render(<TagListPage />, { wrapper })

      expect(screen.getByText(`#${'a'.repeat(100)}`)).toBeInTheDocument()
    })

    it('should handle tags with zero count', () => {
      mockUseTags.mockReturnValue({
        data: [{ tag: 'empty-tag', count: 0 }],
        isLoading: false,
        error: null,
      })

      render(<TagListPage />, { wrapper })

      expect(screen.getByText('0 nodes')).toBeInTheDocument()
    })

    it('should handle very high node counts', () => {
      mockUseTags.mockReturnValue({
        data: [{ tag: 'popular-tag', count: 9999 }],
        isLoading: false,
        error: null,
      })

      render(<TagListPage />, { wrapper })

      expect(screen.getByText('9999 nodes')).toBeInTheDocument()
    })
  })

  describe('Data Flow', () => {
    it('should call useTags hook', () => {
      render(<TagListPage />, { wrapper })

      expect(mockUseTags).toHaveBeenCalledTimes(1)
    })

    it('should handle hook being called multiple times', () => {
      const { rerender } = render(<TagListPage />, { wrapper })
      rerender(<TagListPage />)

      expect(mockUseTags).toHaveBeenCalledTimes(2)
    })
  })
})