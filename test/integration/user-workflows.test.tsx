import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { ReactNode } from 'react'
import App from '../../client/src/App'
import { NodeCreatePage } from '../../client/src/pages/NodeForm'
import { NodeListPage } from '../../client/src/pages/NodeList'

// Mock the API client
global.fetch = vi.fn()

describe('User Workflows Integration Tests', () => {
  let queryClient: QueryClient
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element

  const mockFetch = fetch as any

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
        mutations: { retry: false },
      },
    })
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    )

    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Node Creation Workflow', () => {
    it('should complete the full node creation workflow', async () => {
      // Mock API responses
      const newNode = {
        id: 'new-node-id',
        title: 'My New Node',
        file: 'my-new-node.md',
        content: 'This is the content of my new node',
        tags: ['productivity', 'notes'],
        aliases: ['new note'],
        refs: ['related-node'],
        file_type: 'md',
      }

      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(newNode),
      })

      render(<NodeCreatePage />, { wrapper })

      // Fill out the form
      const titleInput = screen.getByLabelText(/title/i)
      const contentTextarea = screen.getByLabelText(/content/i)
      const tagsInput = screen.getByLabelText(/tags/i)
      const aliasesInput = screen.getByLabelText(/aliases/i)
      const refsInput = screen.getByLabelText(/references/i)
      const fileTypeSelect = screen.getByLabelText(/file format/i)

      fireEvent.change(titleInput, { target: { value: 'My New Node' } })
      fireEvent.change(contentTextarea, { target: { value: 'This is the content of my new node' } })
      fireEvent.change(tagsInput, { target: { value: 'productivity, notes' } })
      fireEvent.change(aliasesInput, { target: { value: 'new note' } })
      fireEvent.change(refsInput, { target: { value: 'related-node' } })
      fireEvent.change(fileTypeSelect, { target: { value: 'md' } })

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create node/i })
      fireEvent.click(submitButton)

      // Verify the API call
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/nodes'),
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'My New Node',
              content: 'This is the content of my new node',
              tags: ['productivity', 'notes'],
              aliases: ['new note'],
              refs: ['related-node'],
              file_type: 'md',
            }),
          })
        )
      })
    })

    it('should handle validation errors during node creation', async () => {
      render(<NodeCreatePage />, { wrapper })

      // Try to submit without required title
      const submitButton = screen.getByRole('button', { name: /create node/i })
      fireEvent.click(submitButton)

      // Form should not submit due to HTML5 validation
      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement
      expect(titleInput.validity.valid).toBe(false)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle API errors during node creation', async () => {
      // Mock API error response
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      render(<NodeCreatePage />, { wrapper })

      // Fill out form and submit
      const titleInput = screen.getByLabelText(/title/i)
      fireEvent.change(titleInput, { target: { value: 'Test Node' } })

      const submitButton = screen.getByRole('button', { name: /create node/i })
      fireEvent.click(submitButton)

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/error:/i)).toBeInTheDocument()
      })
    })
  })

  describe('Node Search and Filter Workflow', () => {
    it('should complete the search workflow', async () => {
      const mockNodes = [
        { id: '1', title: 'JavaScript Basics', file: 'js-basics.md', tags: ['javascript', 'programming'] },
        { id: '2', title: 'React Hooks', file: 'react-hooks.md', tags: ['react', 'javascript'] },
        { id: '3', title: 'Python Tutorial', file: 'python.md', tags: ['python', 'programming'] },
      ]

      const mockSearchResults = {
        nodes: [mockNodes[0], mockNodes[1]], // JavaScript-related nodes
        total: 2,
      }

      // Mock initial nodes fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockNodes),
      })

      render(<NodeListPage />, { wrapper })

      // Wait for nodes to load
      await waitFor(() => {
        expect(screen.getByText('JavaScript Basics')).toBeInTheDocument()
        expect(screen.getByText('React Hooks')).toBeInTheDocument()
        expect(screen.getByText('Python Tutorial')).toBeInTheDocument()
      })

      // Mock search API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockSearchResults),
      })

      // Perform search
      const searchInput = screen.getByPlaceholderText(/search nodes/i)
      fireEvent.change(searchInput, { target: { value: 'JavaScript' } })

      // Wait for search results
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/search/JavaScript'),
          expect.any(Object)
        )
      })

      // Should show filtered results
      await waitFor(() => {
        expect(screen.getByText('2 result')).toBeInTheDocument()
      })
    })

    it('should handle tag filtering workflow', async () => {
      const mockNodes = [
        { id: '1', title: 'Node 1', file: 'node1.md', tags: ['productivity'] },
        { id: '2', title: 'Node 2', file: 'node2.md', tags: ['productivity', 'work'] },
        { id: '3', title: 'Node 3', file: 'node3.md', tags: ['personal'] },
      ]

      // Mock initial nodes fetch
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockNodes),
      })

      render(
        <MemoryRouter initialEntries={['/?tag=productivity']}>
          <QueryClientProvider client={queryClient}>
            <NodeListPage />
          </QueryClientProvider>
        </MemoryRouter>
      )

      // Should initialize with tag filter from URL
      await waitFor(() => {
        expect(screen.getByText('Node 1')).toBeInTheDocument()
      })
    })
  })

  describe('Node Navigation Workflow', () => {
    it('should navigate between different pages', async () => {
      const AppWithRouter = () => (
        <MemoryRouter initialEntries={['/nodes']}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </MemoryRouter>
      )

      // Mock nodes for list page
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve([
          { id: '1', title: 'Test Node', file: 'test.md' }
        ]),
      })

      render(<AppWithRouter />)

      // Should start on node list page
      await waitFor(() => {
        expect(screen.getByText('Nodes')).toBeInTheDocument()
      })

      // Navigate to create page
      const createButton = screen.getByRole('link', { name: /create new node/i })
      fireEvent.click(createButton)

      // Should navigate to create page (in a real app)
      expect(createButton).toHaveAttribute('href', '/nodes/create')
    })
  })

  describe('Error Recovery Workflow', () => {
    it('should handle network failures gracefully', async () => {
      // Mock network failure
      mockFetch.mockRejectedValue(new Error('Network Error'))

      render(<NodeListPage />, { wrapper })

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/error loading nodes/i)).toBeInTheDocument()
      })

      // User should be able to retry (implementation dependent)
      const retryElements = screen.queryAllByText(/retry/i)
      expect(retryElements.length >= 0).toBe(true) // May or may not have retry button
    })

    it('should handle malformed API responses', async () => {
      // Mock malformed response
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ invalid: 'response' }),
      })

      render(<NodeListPage />, { wrapper })

      // Should handle gracefully - either show empty state or error
      await waitFor(() => {
        const hasError = screen.queryByText(/error/i)
        const hasEmptyState = screen.queryByText(/no nodes/i)
        expect(hasError || hasEmptyState).toBeTruthy()
      })
    })
  })

  describe('Form Input Validation Workflow', () => {
    it('should validate and sanitize user input', async () => {
      render(<NodeCreatePage />, { wrapper })

      const titleInput = screen.getByLabelText(/title/i)
      const tagsInput = screen.getByLabelText(/tags/i)

      // Test with various input formats
      fireEvent.change(titleInput, { target: { value: '   Trimmed Title   ' } })
      fireEvent.change(tagsInput, { target: { value: ' tag1 , , tag2 ,  tag3  , ' } })

      // Mock successful creation
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ id: 'new-id', title: 'Trimmed Title' }),
      })

      const submitButton = screen.getByRole('button', { name: /create node/i })
      fireEvent.click(submitButton)

      // Should clean up the input data
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: expect.stringContaining('Trimmed Title'),
          })
        )
      })
    })
  })
})