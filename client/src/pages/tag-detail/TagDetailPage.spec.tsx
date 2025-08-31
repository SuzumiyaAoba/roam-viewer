import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Node } from '../../entities/node'
import { TagDetailPage } from './TagDetailPage'

// Mock the Layout component
vi.mock('../../widgets/layout', () => ({
  Layout: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

// Mock the NodeCard component
vi.mock('../components/design-system/NodeCard', () => ({
  NodeCard: ({ title, file, tags, onCardClick }: any) => (
    <div data-testid="node-card" onClick={onCardClick}>
      <h3>{title}</h3>
      <p>{file}</p>
      <div>{tags?.join(', ')}</div>
    </div>
  ),
}))

// Mock the useNodesByTag hook and useParams
const mockUseNodesByTag = vi.fn()
const mockUseParams = vi.fn()
const mockUseNavigate = vi.fn()

vi.mock('../hooks/useNodes', () => ({
  useNodesByTag: (tag: string) => mockUseNodesByTag(tag),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => mockUseParams(),
    useNavigate: () => mockUseNavigate(),
  }
})

// Mock iconify
vi.mock('@iconify/react', () => ({
  Icon: ({ icon, className }: { icon: string; className?: string }) => (
    <div data-testid={`icon-${icon}`} className={className} />
  ),
}))

describe('TagDetailPage', () => {
  let queryClient: QueryClient
  const mockNavigate = vi.fn()

  const renderTagDetailPage = (tag: string = 'test-tag') => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    mockUseParams.mockReturnValue({ tag })
    mockUseNavigate.mockReturnValue(mockNavigate)

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/tags/${tag}`]}>
          <TagDetailPage />
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading state', () => {
    mockUseNodesByTag.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderTagDetailPage('react')

    expect(screen.getByText('Loading nodes...')).toBeInTheDocument()
    expect(screen.getByTestId('icon-lucide:loader-2')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tag: #react' })).toBeInTheDocument()
  })

  it('should display error state', () => {
    mockUseNodesByTag.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
    })

    renderTagDetailPage('react')

    expect(screen.getByText('Error:')).toBeInTheDocument()
    expect(screen.getByText('Failed to load nodes for tag "#react".')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to tags/i })).toHaveAttribute('href', '/tags')
  })

  it('should display empty state when no nodes', () => {
    mockUseNodesByTag.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    renderTagDetailPage('empty-tag')

    expect(screen.getByText('No nodes found with tag "#empty-tag"')).toBeInTheDocument()
    expect(
      screen.getByText('Create a new node and add the "#empty-tag" tag to see it here.')
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /create node/i })).toHaveAttribute('href', '/nodes/new')
    expect(screen.getByRole('link', { name: /back to tags/i })).toHaveAttribute('href', '/tags')
  })

  it('should display empty state when nodes is null', () => {
    mockUseNodesByTag.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })

    renderTagDetailPage('null-tag')

    expect(screen.getByText('No nodes found with tag "#null-tag"')).toBeInTheDocument()
  })

  it('should display nodes when loaded', () => {
    const mockNodes: Node[] = [
      {
        id: '1',
        title: 'React Hooks Guide',
        file: 'react-hooks.md',
        tags: ['react', 'hooks'],
        content: 'Guide about React hooks',
      },
      {
        id: '2',
        title: 'React Components',
        file: 'components.md',
        tags: ['react', 'components'],
        content: 'About React components',
      },
    ]

    mockUseNodesByTag.mockReturnValue({
      data: mockNodes,
      isLoading: false,
      error: null,
    })

    renderTagDetailPage('react')

    expect(screen.getByText('#react')).toBeInTheDocument()
    expect(screen.getByText('2 nodes tagged with #react')).toBeInTheDocument()

    // Check if node cards are displayed
    expect(screen.getByText('React Hooks Guide')).toBeInTheDocument()
    expect(screen.getByText('React Components')).toBeInTheDocument()
    expect(screen.getByText('react-hooks.md')).toBeInTheDocument()
    expect(screen.getByText('components.md')).toBeInTheDocument()

    // Check node cards count
    const nodeCards = screen.getAllByTestId('node-card')
    expect(nodeCards).toHaveLength(2)
  })

  it('should display correct singular form for single node', () => {
    const mockNodes: Node[] = [
      {
        id: '1',
        title: 'Single Node',
        file: 'single.md',
        tags: ['single'],
        content: 'Only one node',
      },
    ]

    mockUseNodesByTag.mockReturnValue({
      data: mockNodes,
      isLoading: false,
      error: null,
    })

    renderTagDetailPage('single')

    expect(screen.getByText('1 node tagged with #single')).toBeInTheDocument()
  })

  it('should have correct navigation links', () => {
    const mockNodes: Node[] = [
      {
        id: '1',
        title: 'Test Node',
        file: 'test.md',
        tags: ['test'],
        content: 'Test content',
      },
    ]

    mockUseNodesByTag.mockReturnValue({
      data: mockNodes,
      isLoading: false,
      error: null,
    })

    renderTagDetailPage('test')

    // Check back to tags link
    expect(screen.getByRole('link', { name: /back to tags/i })).toHaveAttribute('href', '/tags')

    // Check view all nodes link
    expect(screen.getByRole('link', { name: /view all nodes/i })).toHaveAttribute(
      'href',
      '/nodes?tag=test'
    )

    // Check create node link
    expect(screen.getByRole('link', { name: /create node/i })).toHaveAttribute('href', '/nodes/new')
  })

  it('should handle special characters in tag names', () => {
    const mockNodes: Node[] = [
      {
        id: '1',
        title: 'C++ Guide',
        file: 'cpp.md',
        tags: ['c++'],
        content: 'C++ programming guide',
      },
    ]

    mockUseNodesByTag.mockReturnValue({
      data: mockNodes,
      isLoading: false,
      error: null,
    })

    renderTagDetailPage('c++')

    expect(screen.getByText('#c++')).toBeInTheDocument()
    expect(screen.getByText('1 node tagged with #c++')).toBeInTheDocument()

    // Check that the view all nodes link is properly encoded
    const viewAllLink = screen.getByRole('link', { name: /view all nodes/i })
    expect(viewAllLink).toHaveAttribute('href', '/nodes?tag=c%2B%2B')
  })

  it('should handle node card click navigation', () => {
    const mockNodes: Node[] = [
      {
        id: 'test-node-id',
        title: 'Clickable Node',
        file: 'clickable.md',
        tags: ['test'],
        content: 'Clickable node content',
      },
    ]

    mockUseNodesByTag.mockReturnValue({
      data: mockNodes,
      isLoading: false,
      error: null,
    })

    renderTagDetailPage('test')

    const nodeCard = screen.getByTestId('node-card')
    nodeCard.click()

    expect(mockNavigate).toHaveBeenCalledWith('/nodes/test-node-id')
  })

  it('should display correct icons', () => {
    const mockNodes: Node[] = [
      {
        id: '1',
        title: 'Test Node',
        file: 'test.md',
        tags: ['test'],
        content: 'Test content',
      },
    ]

    mockUseNodesByTag.mockReturnValue({
      data: mockNodes,
      isLoading: false,
      error: null,
    })

    renderTagDetailPage('test')

    expect(screen.getByTestId('icon-lucide:arrow-left')).toBeInTheDocument()
    expect(screen.getByTestId('icon-lucide:hash')).toBeInTheDocument()
    expect(screen.getByTestId('icon-lucide:list')).toBeInTheDocument()
    expect(screen.getByTestId('icon-lucide:plus')).toBeInTheDocument()
  })

  it('should call useNodesByTag with correct tag parameter', () => {
    mockUseNodesByTag.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    renderTagDetailPage('specific-tag')

    expect(mockUseNodesByTag).toHaveBeenCalledWith('specific-tag')
  })
})
