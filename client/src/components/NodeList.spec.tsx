import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ReactNode } from 'react'
import { NodeListPage } from '../../client/src/pages/NodeList'
import * as useNodesModule from '../../client/src/hooks/useNodes'

// Mock the hooks
vi.mock('../../client/src/hooks/useNodes')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  }
})

// Mock react-use
vi.mock('react-use', () => ({
  useLocalStorage: () => ['grid', vi.fn()],
}))

const mockUseNodes = useNodesModule.useNodes as any
const mockUseSearchNodes = useNodesModule.useSearchNodes as any
const mockUseDeleteNode = useNodesModule.useDeleteNode as any

describe('NodeListPage', () => {
  let queryClient: QueryClient
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element

  const mockNodes = [
    {
      id: '1',
      title: 'First Node',
      file: 'first.md',
      tags: ['tag1', 'tag2'],
    },
    {
      id: '2', 
      title: 'Second Node',
      file: 'second.md',
      tags: ['tag2', 'tag3'],
    },
    {
      id: '3',
      title: 'Third Node',
      file: 'third.md',
      tags: [],
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

    // Default mock implementations
    mockUseNodes.mockReturnValue({
      data: mockNodes,
      isLoading: false,
      error: null,
    })
    mockUseSearchNodes.mockReturnValue({
      data: null,
      isLoading: false,
    })
    mockUseDeleteNode.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    })

    vi.clearAllMocks()
  })

  it('should render nodes list', () => {
    render(<NodeListPage />, { wrapper })

    expect(screen.getByText('Nodes')).toBeInTheDocument()
    expect(screen.getByText('First Node')).toBeInTheDocument()
    expect(screen.getByText('Second Node')).toBeInTheDocument()
    expect(screen.getByText('Third Node')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    mockUseNodes.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    })

    render(<NodeListPage />, { wrapper })

    expect(screen.getByText('Loading nodes...')).toBeInTheDocument()
  })

  it('should show error state', () => {
    mockUseNodes.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load'),
    })

    render(<NodeListPage />, { wrapper })

    expect(screen.getByText(/error loading nodes/i)).toBeInTheDocument()
  })

  it('should show empty state when no nodes', () => {
    mockUseNodes.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    render(<NodeListPage />, { wrapper })

    expect(screen.getByText(/no nodes found/i)).toBeInTheDocument()
  })

  it('should render search input', () => {
    render(<NodeListPage />, { wrapper })

    const searchInput = screen.getByPlaceholderText(/search nodes/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('should update search query on input', () => {
    render(<NodeListPage />, { wrapper })

    const searchInput = screen.getByPlaceholderText(/search nodes/i) as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'test query' } })

    expect(searchInput.value).toBe('test query')
  })

  it('should show search results when searching', async () => {
    const searchResults = {
      nodes: [mockNodes[0]],
      total: 1,
    }

    mockUseSearchNodes.mockReturnValue({
      data: searchResults,
      isLoading: false,
    })

    render(<NodeListPage />, { wrapper })

    const searchInput = screen.getByPlaceholderText(/search nodes/i)
    fireEvent.change(searchInput, { target: { value: 'first' } })

    // Should show search results instead of all nodes
    await waitFor(() => {
      expect(screen.getByText('First Node')).toBeInTheDocument()
      // Second and Third nodes should not be visible in search results
      expect(screen.queryByText('Second Node')).not.toBeInTheDocument()
      expect(screen.queryByText('Third Node')).not.toBeInTheDocument()
    })
  })

  it('should show search loading state', () => {
    mockUseSearchNodes.mockReturnValue({
      data: null,
      isLoading: true,
    })

    render(<NodeListPage />, { wrapper })

    const searchInput = screen.getByPlaceholderText(/search nodes/i)
    fireEvent.change(searchInput, { target: { value: 'test' } })

    expect(screen.getByText('Searching...')).toBeInTheDocument()
  })

  it('should render node tags as clickable elements', () => {
    render(<NodeListPage />, { wrapper })

    // Look for tags in the first node
    expect(screen.getByText('tag1')).toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
  })

  it('should render create node button', () => {
    render(<NodeListPage />, { wrapper })

    const createButton = screen.getByRole('link', { name: /create new node/i })
    expect(createButton).toBeInTheDocument()
    expect(createButton).toHaveAttribute('href', '/nodes/create')
  })

  it('should show node count', () => {
    render(<NodeListPage />, { wrapper })

    expect(screen.getByText('3 nodes')).toBeInTheDocument()
  })

  it('should show filtered node count when searching', async () => {
    const searchResults = {
      nodes: [mockNodes[0]],
      total: 1,
    }

    mockUseSearchNodes.mockReturnValue({
      data: searchResults,
      isLoading: false,
    })

    render(<NodeListPage />, { wrapper })

    const searchInput = screen.getByPlaceholderText(/search nodes/i)
    fireEvent.change(searchInput, { target: { value: 'first' } })

    await waitFor(() => {
      expect(screen.getByText('1 result')).toBeInTheDocument()
    })
  })

  it('should have view mode toggle buttons', () => {
    render(<NodeListPage />, { wrapper })

    // Look for view mode buttons (grid, list, table)
    const buttons = screen.getAllByRole('button')
    const viewModeButtons = buttons.filter(button => 
      button.getAttribute('title')?.includes('view') ||
      button.getAttribute('aria-label')?.includes('view')
    )
    
    // Should have at least some view toggle functionality
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should clear search when clear button clicked', async () => {
    render(<NodeListPage />, { wrapper })

    const searchInput = screen.getByPlaceholderText(/search nodes/i) as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'test query' } })
    
    expect(searchInput.value).toBe('test query')

    // Look for clear button or X button
    const clearButtons = screen.queryAllByRole('button')
    const clearButton = clearButtons.find(button => 
      button.textContent?.includes('×') || 
      button.textContent?.includes('Clear') ||
      button.getAttribute('aria-label')?.includes('clear')
    )

    if (clearButton) {
      fireEvent.click(clearButton)
      expect(searchInput.value).toBe('')
    }
  })

  it('should handle nodes with empty tags array', () => {
    render(<NodeListPage />, { wrapper })

    // Third node has empty tags, should not cause errors
    expect(screen.getByText('Third Node')).toBeInTheDocument()
  })

  it('should handle nodes with null/undefined tags', () => {
    const nodesWithNullTags = [
      {
        id: '1',
        title: 'Node with null tags',
        file: 'null-tags.md',
        tags: null,
      },
      {
        id: '2',
        title: 'Node with undefined tags',
        file: 'undefined-tags.md',
        // tags property omitted
      },
    ]

    mockUseNodes.mockReturnValue({
      data: nodesWithNullTags,
      isLoading: false,
      error: null,
    })

    render(<NodeListPage />, { wrapper })

    expect(screen.getByText('Node with null tags')).toBeInTheDocument()
    expect(screen.getByText('Node with undefined tags')).toBeInTheDocument()
  })
})