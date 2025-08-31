import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Node } from '../../entities/node'
import { NodeEditPage, NodeFormPage } from './NodeFormPage'

// Mock the Layout component
vi.mock('../../widgets/layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}))

// Mock the hooks
const mockUseNode = vi.fn()
const mockUseCreateNode = vi.fn()
const mockUseUpdateNode = vi.fn()
const mockUseParams = vi.fn()
const mockUseNavigate = vi.fn()

vi.mock('../hooks/useNodes', () => ({
  useNode: (id: string) => mockUseNode(id),
  useCreateNode: () => mockUseCreateNode(),
  useUpdateNode: () => mockUseUpdateNode(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => mockUseParams(),
    useNavigate: () => mockUseNavigate(),
  }
})

describe('NodeCreatePage', () => {
  let queryClient: QueryClient
  const mockNavigate = vi.fn()
  const mockCreateMutate = vi.fn()

  const renderNodeCreatePage = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    mockUseNavigate.mockReturnValue(mockNavigate)
    mockUseCreateNode.mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: null,
    })

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <NodeCreatePage />
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render create form with all fields', () => {
    renderNodeCreatePage()

    expect(screen.getByText('Create New Node')).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/file format/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/aliases/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/references/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create node/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute('href', '/nodes')
  })

  it('should have correct default values', () => {
    renderNodeCreatePage()

    expect(screen.getByDisplayValue('')).toBeInTheDocument() // Title field
    expect(screen.getByDisplayValue('md')).toBeInTheDocument() // File format
    expect(screen.getByText('Markdown (.md)')).toBeSelected()
  })

  it('should handle form input changes', () => {
    renderNodeCreatePage()

    const titleInput = screen.getByLabelText(/title/i)
    const contentTextarea = screen.getByLabelText(/content/i)
    const tagsInput = screen.getByLabelText(/tags/i)

    fireEvent.change(titleInput, { target: { value: 'Test Node' } })
    fireEvent.change(contentTextarea, { target: { value: 'Test content' } })
    fireEvent.change(tagsInput, { target: { value: 'tag1, tag2' } })

    expect(titleInput).toHaveValue('Test Node')
    expect(contentTextarea).toHaveValue('Test content')
    expect(tagsInput).toHaveValue('tag1, tag2')
  })

  it('should handle file format selection', () => {
    renderNodeCreatePage()

    const formatSelect = screen.getByLabelText(/file format/i)
    fireEvent.change(formatSelect, { target: { value: 'org' } })

    expect(formatSelect).toHaveValue('org')
  })

  it('should submit form with correct data', async () => {
    renderNodeCreatePage()

    const titleInput = screen.getByLabelText(/title/i)
    const contentTextarea = screen.getByLabelText(/content/i)
    const tagsInput = screen.getByLabelText(/tags/i)
    const aliasesInput = screen.getByLabelText(/aliases/i)
    const refsInput = screen.getByLabelText(/references/i)
    const submitButton = screen.getByRole('button', { name: /create node/i })

    fireEvent.change(titleInput, { target: { value: 'Test Node' } })
    fireEvent.change(contentTextarea, { target: { value: 'Test content' } })
    fireEvent.change(tagsInput, { target: { value: 'tag1, tag2, tag3' } })
    fireEvent.change(aliasesInput, { target: { value: 'alias1, alias2' } })
    fireEvent.change(refsInput, { target: { value: 'ref1, ref2' } })

    fireEvent.click(submitButton)

    expect(mockCreateMutate).toHaveBeenCalledWith(
      {
        title: 'Test Node',
        content: 'Test content',
        tags: ['tag1', 'tag2', 'tag3'],
        aliases: ['alias1', 'alias2'],
        refs: ['ref1', 'ref2'],
        file_type: 'md',
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
  })

  it('should handle successful creation and navigate', async () => {
    const mockNewNode = { id: 'new-node-id', title: 'Test Node' }

    mockUseCreateNode.mockReturnValue({
      mutate: (data: any, options: any) => {
        options.onSuccess(mockNewNode)
      },
      isPending: false,
      error: null,
    })

    renderNodeCreatePage()

    const titleInput = screen.getByLabelText(/title/i)
    const submitButton = screen.getByRole('button', { name: /create node/i })

    fireEvent.change(titleInput, { target: { value: 'Test Node' } })
    fireEvent.click(submitButton)

    expect(mockNavigate).toHaveBeenCalledWith('/nodes/new-node-id')
  })

  it('should handle creation error', () => {
    const mockError = new Error('Failed to create node')
    mockUseCreateNode.mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: mockError,
    })

    renderNodeCreatePage()

    expect(screen.getByText(/error.*failed to create node/i)).toBeInTheDocument()
    expect(screen.getByText('Failed to create node')).toBeInTheDocument()
  })

  it('should show loading state during creation', () => {
    mockUseCreateNode.mockReturnValue({
      mutate: mockCreateMutate,
      isPending: true,
      error: null,
    })

    renderNodeCreatePage()

    const submitButton = screen.getByRole('button', { name: /creating.../i })
    expect(submitButton).toBeDisabled()
  })

  it('should handle empty tags correctly', () => {
    renderNodeCreatePage()

    const tagsInput = screen.getByLabelText(/tags/i)
    const submitButton = screen.getByRole('button', { name: /create node/i })

    fireEvent.change(tagsInput, { target: { value: '  ,  ,   ' } }) // Only whitespace and commas
    fireEvent.click(submitButton)

    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: [], // Should be filtered to empty array
      }),
      expect.any(Object)
    )
  })
})

describe('NodeEditPage', () => {
  let queryClient: QueryClient
  const mockNavigate = vi.fn()
  const mockUpdateMutate = vi.fn()

  const mockNode: Node = {
    id: 'test-id',
    title: 'Test Node',
    content: 'Test content',
    tags: ['tag1', 'tag2'],
    aliases: ['alias1'],
    refs: ['ref1'],
    file: 'test.md',
  }

  const renderNodeEditPage = (nodeId: string = 'test-id') => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    mockUseParams.mockReturnValue({ id: nodeId })
    mockUseNavigate.mockReturnValue(mockNavigate)
    mockUseUpdateNode.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    })

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <NodeEditPage />
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state', () => {
    mockUseNode.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderNodeEditPage()

    expect(screen.getByText('Loading node...')).toBeInTheDocument()
  })

  it('should show error state when node not found', () => {
    mockUseNode.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Not found'),
    })

    renderNodeEditPage()

    expect(screen.getByText(/error.*node not found/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to nodes/i })).toHaveAttribute('href', '/nodes')
  })

  it('should populate form with existing node data', () => {
    mockUseNode.mockReturnValue({
      data: mockNode,
      isLoading: false,
      error: null,
    })

    renderNodeEditPage()

    expect(screen.getByText('Edit: Test Node')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Node')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test content')).toBeInTheDocument()
    expect(screen.getByDisplayValue('tag1, tag2')).toBeInTheDocument()
    expect(screen.getByDisplayValue('alias1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('ref1')).toBeInTheDocument()
  })

  it('should handle form changes', () => {
    mockUseNode.mockReturnValue({
      data: mockNode,
      isLoading: false,
      error: null,
    })

    renderNodeEditPage()

    const titleInput = screen.getByLabelText(/title/i)
    fireEvent.change(titleInput, { target: { value: 'Updated Node' } })

    expect(titleInput).toHaveValue('Updated Node')
  })

  it('should submit update with correct data', async () => {
    mockUseNode.mockReturnValue({
      data: mockNode,
      isLoading: false,
      error: null,
    })

    renderNodeEditPage()

    const titleInput = screen.getByLabelText(/title/i)
    const submitButton = screen.getByRole('button', { name: /update node/i })

    fireEvent.change(titleInput, { target: { value: 'Updated Node' } })
    fireEvent.click(submitButton)

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      {
        id: 'test-id',
        data: {
          title: 'Updated Node',
          content: 'Test content',
          tags: ['tag1', 'tag2'],
          aliases: ['alias1'],
          refs: ['ref1'],
        },
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
  })

  it('should handle successful update and navigate', () => {
    mockUseNode.mockReturnValue({
      data: mockNode,
      isLoading: false,
      error: null,
    })

    mockUseUpdateNode.mockReturnValue({
      mutate: (data: any, options: any) => {
        options.onSuccess()
      },
      isPending: false,
      error: null,
    })

    renderNodeEditPage()

    const submitButton = screen.getByRole('button', { name: /update node/i })
    fireEvent.click(submitButton)

    expect(mockNavigate).toHaveBeenCalledWith('/nodes/test-id')
  })

  it('should show update error', () => {
    mockUseNode.mockReturnValue({
      data: mockNode,
      isLoading: false,
      error: null,
    })

    const mockError = new Error('Failed to update')
    mockUseUpdateNode.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: mockError,
    })

    renderNodeEditPage()

    expect(screen.getByText(/error.*failed to update node/i)).toBeInTheDocument()
    expect(screen.getByText('Failed to update')).toBeInTheDocument()
  })

  it('should show loading state during update', () => {
    mockUseNode.mockReturnValue({
      data: mockNode,
      isLoading: false,
      error: null,
    })

    mockUseUpdateNode.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: true,
      error: null,
    })

    renderNodeEditPage()

    const submitButton = screen.getByRole('button', { name: /updating.../i })
    expect(submitButton).toBeDisabled()
  })

  it('should have correct navigation links', () => {
    mockUseNode.mockReturnValue({
      data: mockNode,
      isLoading: false,
      error: null,
    })

    renderNodeEditPage()

    expect(screen.getByRole('link', { name: /back to node/i })).toHaveAttribute(
      'href',
      '/nodes/test-id'
    )
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute('href', '/nodes/test-id')
  })

  it('should handle nodes with missing fields', () => {
    const nodeWithMissingFields: Node = {
      id: 'test-id',
      title: 'Minimal Node',
      file: 'minimal.md',
    }

    mockUseNode.mockReturnValue({
      data: nodeWithMissingFields,
      isLoading: false,
      error: null,
    })

    renderNodeEditPage()

    expect(screen.getByDisplayValue('Minimal Node')).toBeInTheDocument()
    expect(screen.getByDisplayValue('')).toBeInTheDocument() // Empty content field
    // Tags, aliases, refs should be empty strings
    const emptyInputs = screen.getAllByDisplayValue('')
    expect(emptyInputs.length).toBeGreaterThan(1)
  })
})
