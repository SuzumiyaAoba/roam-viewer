import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ReactNode } from 'react'
import { NodeCreatePage, NodeEditPage } from '../../client/src/pages/NodeForm'
import * as useNodesModule from '../../client/src/hooks/useNodes'

// Mock the hooks
vi.mock('../../client/src/hooks/useNodes')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: 'test-id' }),
  }
})

const mockUseCreateNode = useNodesModule.useCreateNode as any
const mockUseUpdateNode = useNodesModule.useUpdateNode as any
const mockUseNode = useNodesModule.useNode as any

describe('NodeForm Components', () => {
  let queryClient: QueryClient
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element

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
    vi.clearAllMocks()
  })

  describe('NodeCreatePage', () => {
    beforeEach(() => {
      mockUseCreateNode.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
      })
    })

    it('should render create form with all fields', () => {
      render(<NodeCreatePage />, { wrapper })

      expect(screen.getByText('Create New Node')).toBeInTheDocument()
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/file format/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/content/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/aliases/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/references/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create node/i })).toBeInTheDocument()
    })

    it('should have default file format as md', () => {
      render(<NodeCreatePage />, { wrapper })

      const fileFormatSelect = screen.getByLabelText(/file format/i) as HTMLSelectElement
      expect(fileFormatSelect.value).toBe('md')
    })

    it('should allow changing file format', () => {
      render(<NodeCreatePage />, { wrapper })

      const fileFormatSelect = screen.getByLabelText(/file format/i) as HTMLSelectElement
      fireEvent.change(fileFormatSelect, { target: { value: 'org' } })
      
      expect(fileFormatSelect.value).toBe('org')
    })

    it('should update form fields when typing', () => {
      render(<NodeCreatePage />, { wrapper })

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement
      const contentTextarea = screen.getByLabelText(/content/i) as HTMLTextAreaElement
      const tagsInput = screen.getByLabelText(/tags/i) as HTMLInputElement

      fireEvent.change(titleInput, { target: { value: 'Test Title' } })
      fireEvent.change(contentTextarea, { target: { value: 'Test content' } })
      fireEvent.change(tagsInput, { target: { value: 'tag1, tag2' } })

      expect(titleInput.value).toBe('Test Title')
      expect(contentTextarea.value).toBe('Test content')
      expect(tagsInput.value).toBe('tag1, tag2')
    })

    it('should submit form with correct data', async () => {
      const mockMutate = vi.fn()
      mockUseCreateNode.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      })

      render(<NodeCreatePage />, { wrapper })

      const titleInput = screen.getByLabelText(/title/i)
      const contentTextarea = screen.getByLabelText(/content/i)
      const tagsInput = screen.getByLabelText(/tags/i)
      const aliasesInput = screen.getByLabelText(/aliases/i)
      const refsInput = screen.getByLabelText(/references/i)
      const submitButton = screen.getByRole('button', { name: /create node/i })

      fireEvent.change(titleInput, { target: { value: 'Test Title' } })
      fireEvent.change(contentTextarea, { target: { value: 'Test content' } })
      fireEvent.change(tagsInput, { target: { value: 'tag1, tag2' } })
      fireEvent.change(aliasesInput, { target: { value: 'alias1, alias2' } })
      fireEvent.change(refsInput, { target: { value: 'ref1, ref2' } })

      fireEvent.click(submitButton)

      expect(mockMutate).toHaveBeenCalledWith({
        title: 'Test Title',
        content: 'Test content',
        tags: ['tag1', 'tag2'],
        aliases: ['alias1', 'alias2'],
        refs: ['ref1', 'ref2'],
        file_type: 'md',
      }, expect.any(Object))
    })

    it('should show loading state when creating', () => {
      mockUseCreateNode.mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
        error: null,
      })

      render(<NodeCreatePage />, { wrapper })

      expect(screen.getByText('Creating...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /creating.../i })).toBeDisabled()
    })

    it('should show error message when creation fails', () => {
      mockUseCreateNode.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: new Error('Creation failed'),
      })

      render(<NodeCreatePage />, { wrapper })

      expect(screen.getByText(/error:/i)).toBeInTheDocument()
      expect(screen.getByText(/creation failed/i)).toBeInTheDocument()
    })

    it('should require title field', () => {
      render(<NodeCreatePage />, { wrapper })

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement
      expect(titleInput.required).toBe(true)
    })

    it('should parse tags correctly with whitespace', async () => {
      const mockMutate = vi.fn()
      mockUseCreateNode.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      })

      render(<NodeCreatePage />, { wrapper })

      const titleInput = screen.getByLabelText(/title/i)
      const tagsInput = screen.getByLabelText(/tags/i)
      const submitButton = screen.getByRole('button', { name: /create node/i })

      fireEvent.change(titleInput, { target: { value: 'Test' } })
      fireEvent.change(tagsInput, { target: { value: ' tag1 , tag2 , , tag3 ' } })
      fireEvent.click(submitButton)

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['tag1', 'tag2', 'tag3'], // Empty tags should be filtered out
        }),
        expect.any(Object)
      )
    })
  })

  describe('NodeEditPage', () => {
    const mockNode = {
      id: 'test-id',
      title: 'Test Node',
      file: 'test.md',
      content: 'Test content',
      tags: ['tag1', 'tag2'],
      aliases: ['alias1'],
      refs: ['ref1'],
    }

    beforeEach(() => {
      mockUseNode.mockReturnValue({
        data: mockNode,
        isLoading: false,
        error: null,
      })
      mockUseUpdateNode.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
      })
    })

    it('should render edit form with pre-filled data', async () => {
      render(<NodeEditPage />, { wrapper })

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Node')).toBeInTheDocument()
      })

      expect(screen.getByDisplayValue('Test content')).toBeInTheDocument()
      expect(screen.getByDisplayValue('tag1, tag2')).toBeInTheDocument()
      expect(screen.getByDisplayValue('alias1')).toBeInTheDocument()
      expect(screen.getByDisplayValue('ref1')).toBeInTheDocument()
    })

    it('should show loading state while fetching node', () => {
      mockUseNode.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      })

      render(<NodeEditPage />, { wrapper })

      expect(screen.getByText('Loading node...')).toBeInTheDocument()
    })

    it('should show error state when node not found', () => {
      mockUseNode.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Not found'),
      })

      render(<NodeEditPage />, { wrapper })

      expect(screen.getByText(/error:/i)).toBeInTheDocument()
      expect(screen.getByText(/node not found/i)).toBeInTheDocument()
    })

    it('should submit update with correct data', async () => {
      const mockMutate = vi.fn()
      mockUseUpdateNode.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      })

      render(<NodeEditPage />, { wrapper })

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Node')).toBeInTheDocument()
      })

      const titleInput = screen.getByDisplayValue('Test Node')
      const submitButton = screen.getByRole('button', { name: /update node/i })

      fireEvent.change(titleInput, { target: { value: 'Updated Title' } })
      fireEvent.click(submitButton)

      expect(mockMutate).toHaveBeenCalledWith({
        id: 'test-id',
        data: {
          title: 'Updated Title',
          content: 'Test content',
          tags: ['tag1', 'tag2'],
          aliases: ['alias1'],
          refs: ['ref1'],
        },
      }, expect.any(Object))
    })

    it('should show loading state when updating', async () => {
      mockUseUpdateNode.mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
        error: null,
      })

      render(<NodeEditPage />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Updating...')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /updating.../i })).toBeDisabled()
    })

    it('should show error message when update fails', async () => {
      mockUseUpdateNode.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: new Error('Update failed'),
      })

      render(<NodeEditPage />, { wrapper })

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Node')).toBeInTheDocument()
      })

      expect(screen.getByText(/error:/i)).toBeInTheDocument()
      expect(screen.getByText(/update failed/i)).toBeInTheDocument()
    })
  })
})