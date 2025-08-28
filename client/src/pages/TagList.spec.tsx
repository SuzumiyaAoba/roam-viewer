import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TagListPage } from './TagList'

// Mock the Layout component
vi.mock('../components/Layout', () => ({
  Layout: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="layout">
      <h1>{title}</h1>
      {children}
    </div>
  )
}))

// Mock the useTags hook
const mockUseTags = vi.fn()
vi.mock('../hooks/useNodes', () => ({
  useTags: () => mockUseTags()
}))

// Mock iconify
vi.mock('@iconify/react', () => ({
  Icon: ({ icon, className }: { icon: string; className?: string }) => (
    <div data-testid={`icon-${icon}`} className={className} />
  )
}))

describe('TagListPage', () => {
  let queryClient: QueryClient

  const renderTagListPage = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TagListPage />
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading state', () => {
    mockUseTags.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null
    })

    renderTagListPage()

    expect(screen.getByText('Loading tags...')).toBeInTheDocument()
    expect(screen.getByTestId('icon-lucide:loader-2')).toBeInTheDocument()
  })

  it('should display error state', () => {
    mockUseTags.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load')
    })

    renderTagListPage()

    expect(screen.getByText('Error:')).toBeInTheDocument()
    expect(screen.getByText('Failed to load tags.')).toBeInTheDocument()
  })

  it('should display empty state when no tags', () => {
    mockUseTags.mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    })

    renderTagListPage()

    expect(screen.getByText('No tags found')).toBeInTheDocument()
    expect(screen.getByText('Tags will appear here once you add them to your nodes.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /create node/i })).toHaveAttribute('href', '/nodes/new')
  })

  it('should display empty state when tags is null', () => {
    mockUseTags.mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    })

    renderTagListPage()

    expect(screen.getByText('No tags found')).toBeInTheDocument()
  })

  it('should display tags when loaded', () => {
    const mockTags = [
      { tag: 'javascript', count: 5 },
      { tag: 'react', count: 3 },
      { tag: 'testing', count: 1 }
    ]

    mockUseTags.mockReturnValue({
      data: mockTags,
      isLoading: false,
      error: null
    })

    renderTagListPage()

    expect(screen.getByText('Browse 3 tags across your knowledge base')).toBeInTheDocument()
    
    // Check if each tag is displayed
    expect(screen.getByText('#javascript')).toBeInTheDocument()
    expect(screen.getByText('5 nodes')).toBeInTheDocument()
    
    expect(screen.getByText('#react')).toBeInTheDocument()
    expect(screen.getByText('3 nodes')).toBeInTheDocument()
    
    expect(screen.getByText('#testing')).toBeInTheDocument()
    expect(screen.getByText('1 node')).toBeInTheDocument() // Singular form
  })

  it('should display correct singular form for count', () => {
    const mockTags = [
      { tag: 'single', count: 1 }
    ]

    mockUseTags.mockReturnValue({
      data: mockTags,
      isLoading: false,
      error: null
    })

    renderTagListPage()

    expect(screen.getByText('Browse 1 tag across your knowledge base')).toBeInTheDocument()
    expect(screen.getByText('1 node')).toBeInTheDocument()
  })

  it('should have correct links for tag cards', () => {
    const mockTags = [
      { tag: 'javascript', count: 5 }
    ]

    mockUseTags.mockReturnValue({
      data: mockTags,
      isLoading: false,
      error: null
    })

    renderTagListPage()

    // Check tag detail link
    const tagLinks = screen.getAllByRole('link', { name: /javascript/i })
    expect(tagLinks[0]).toHaveAttribute('href', '/tags/javascript')

    // Check filter nodes link
    const filterLink = screen.getByRole('link', { name: /filter nodes/i })
    expect(filterLink).toHaveAttribute('href', '/nodes?tag=javascript')

    // Check view details link
    const detailLink = screen.getByRole('link', { name: /view details/i })
    expect(detailLink).toHaveAttribute('href', '/tags/javascript')
  })

  it('should handle special characters in tag names', () => {
    const mockTags = [
      { tag: 'c++', count: 2 },
      { tag: 'node.js', count: 4 }
    ]

    mockUseTags.mockReturnValue({
      data: mockTags,
      isLoading: false,
      error: null
    })

    renderTagListPage()

    expect(screen.getByText('#c++')).toBeInTheDocument()
    expect(screen.getByText('#node.js')).toBeInTheDocument()
    
    // Check that links are properly encoded
    const cppTagLink = screen.getAllByRole('link')[2] // Skip the create node link
    expect(cppTagLink).toHaveAttribute('href', '/tags/c%2B%2B')
  })

  it('should have create node button in header', () => {
    const mockTags = [
      { tag: 'test', count: 1 }
    ]

    mockUseTags.mockReturnValue({
      data: mockTags,
      isLoading: false,
      error: null
    })

    renderTagListPage()

    const createButtons = screen.getAllByRole('link', { name: /create node/i })
    expect(createButtons).toHaveLength(1)
    expect(createButtons[0]).toHaveAttribute('href', '/nodes/new')
  })

  it('should display correct icons', () => {
    const mockTags = [
      { tag: 'test', count: 1 }
    ]

    mockUseTags.mockReturnValue({
      data: mockTags,
      isLoading: false,
      error: null
    })

    renderTagListPage()

    expect(screen.getByTestId('icon-lucide:hash')).toBeInTheDocument()
    expect(screen.getByTestId('icon-lucide:chevron-right')).toBeInTheDocument()
    expect(screen.getByTestId('icon-lucide:filter')).toBeInTheDocument()
    expect(screen.getByTestId('icon-lucide:plus')).toBeInTheDocument()
  })
})