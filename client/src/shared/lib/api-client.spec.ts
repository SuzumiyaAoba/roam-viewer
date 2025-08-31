import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiClient, ApiError } from '../client/src/lib/api-client'
import type { CreateNodeRequest, UpdateNodeRequest } from '../client/src/types/api'

// Mock fetch globally
global.fetch = vi.fn()

describe('ApiClient', () => {
  let apiClient: ApiClient
  const mockFetch = fetch as any

  beforeEach(() => {
    apiClient = new ApiClient('http://localhost:3001')
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('constructor', () => {
    it('should remove trailing slash from baseUrl', () => {
      const client = new ApiClient('http://localhost:3001/')
      expect((client as any).baseUrl).toBe('http://localhost:3001')
    })

    it('should use default baseUrl if not provided', () => {
      const client = new ApiClient()
      expect((client as any).baseUrl).toBe('http://localhost:3001')
    })
  })

  describe('request method', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: '1', title: 'Test Node' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockData),
      })

      const result = await (apiClient as any).request('/api/test')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/test',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      )
      expect(result).toEqual(mockData)
    })

    it('should handle non-JSON response', async () => {
      const mockText = 'Plain text response'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'text/plain' },
        text: () => Promise.resolve(mockText),
      })

      const result = await (apiClient as any).request('/api/test')
      expect(result).toBe(mockText)
    })

    it('should throw ApiError on HTTP error', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: { get: () => 'application/json' },
      }
      mockFetch.mockResolvedValueOnce(mockResponse)

      await expect((apiClient as any).request('/api/test')).rejects.toThrow(ApiError)
      await expect((apiClient as any).request('/api/test')).rejects.toThrow('HTTP 404: Not Found')
    })

    it('should throw ApiError on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failed'))

      await expect((apiClient as any).request('/api/test')).rejects.toThrow(ApiError)
      await expect((apiClient as any).request('/api/test')).rejects.toThrow(
        'Network error: Network failed'
      )
    })
  })

  describe('node operations', () => {
    it('should get all nodes', async () => {
      const mockNodes = [
        { id: '1', title: 'Node 1', file: 'node1.md' },
        { id: '2', title: 'Node 2', file: 'node2.md' },
      ]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockNodes),
      })

      const result = await apiClient.getNodes()

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/nodes', expect.any(Object))
      expect(result).toEqual(mockNodes)
    })

    it('should get single node', async () => {
      const mockNode = { id: '1', title: 'Test Node', file: 'test.md', content: 'Test content' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockNode),
      })

      const result = await apiClient.getNode('test-id')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/nodes/test-id',
        expect.any(Object)
      )
      expect(result).toEqual(mockNode)
    })

    it('should create node', async () => {
      const createRequest: CreateNodeRequest = {
        title: 'New Node',
        content: 'New content',
        tags: ['tag1', 'tag2'],
        file_type: 'md',
      }
      const mockResponse = { id: 'new-id', ...createRequest }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse),
      })

      const result = await apiClient.createNode(createRequest)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/nodes',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(createRequest),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should update node', async () => {
      const updateRequest: UpdateNodeRequest = {
        title: 'Updated Node',
        content: 'Updated content',
      }
      const mockResponse = { id: 'test-id', ...updateRequest }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse),
      })

      const result = await apiClient.updateNode('test-id', updateRequest)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/nodes/test-id',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateRequest),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should delete node', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({}),
      })

      await apiClient.deleteNode('test-id')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/nodes/test-id',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  describe('search operations', () => {
    it('should search nodes with new API format', async () => {
      const mockResponse = {
        nodes: [{ id: '1', title: 'Found Node', file: 'found.md' }],
        count: 1,
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse),
      })

      const result = await apiClient.searchNodes('test query')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/search/test%20query',
        expect.any(Object)
      )
      expect(result).toEqual({
        nodes: mockResponse.nodes,
        total: 1,
      })
    })

    it('should search nodes with legacy API format', async () => {
      const mockNodes = [{ id: '1', title: 'Found Node', file: 'found.md' }]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockNodes),
      })

      const result = await apiClient.searchNodes('test query')

      expect(result).toEqual({
        nodes: mockNodes,
        total: 1,
      })
    })

    it('should handle empty search results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(null),
      })

      const result = await apiClient.searchNodes('no results')

      expect(result).toEqual({
        nodes: [],
        total: 0,
      })
    })
  })

  describe('tag operations', () => {
    it('should get tags with new API format', async () => {
      const mockResponse = {
        tags: [
          { tag: 'tag1', count: 5 },
          { tag: 'tag2', count: 3 },
        ],
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse),
      })

      const result = await apiClient.getTags()

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tags', expect.any(Object))
      expect(result).toEqual(mockResponse.tags)
    })

    it('should get tags with legacy API format', async () => {
      const mockTags = [
        { tag: 'tag1', count: 5 },
        { tag: 'tag2', count: 3 },
      ]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockTags),
      })

      const result = await apiClient.getTags()
      expect(result).toEqual(mockTags)
    })

    it('should search nodes by tag', async () => {
      const mockResponse = {
        nodes: [{ id: '1', title: 'Tagged Node', file: 'tagged.md', tags: ['test-tag'] }],
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse),
      })

      const result = await apiClient.searchNodesByTag('test-tag')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/search/tag/test-tag',
        expect.any(Object)
      )
      expect(result).toEqual(mockResponse.nodes)
    })
  })

  describe('relationship operations', () => {
    it('should get backlinks', async () => {
      const mockBacklinks = [
        { id: '2', title: 'Linking Node', file: 'linking.md', type: 'backlink' as const },
      ]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockBacklinks),
      })

      const result = await apiClient.getBacklinks('test-id')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/nodes/test-id/backlinks',
        expect.any(Object)
      )
      expect(result).toEqual(mockBacklinks)
    })

    it('should get forward links', async () => {
      const mockLinks = [
        { id: '3', title: 'Linked Node', file: 'linked.md', type: 'forwardlink' as const },
      ]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockLinks),
      })

      const result = await apiClient.getForwardLinks('test-id')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/nodes/test-id/links',
        expect.any(Object)
      )
      expect(result).toEqual(mockLinks)
    })
  })
})

describe('ApiError', () => {
  it('should create error with message only', () => {
    const error = new ApiError('Test error')
    expect(error.message).toBe('Test error')
    expect(error.name).toBe('ApiError')
    expect(error.status).toBeUndefined()
    expect(error.response).toBeUndefined()
  })

  it('should create error with status and response', () => {
    const mockResponse = { status: 404 } as Response
    const error = new ApiError('Not found', 404, mockResponse)

    expect(error.message).toBe('Not found')
    expect(error.status).toBe(404)
    expect(error.response).toBe(mockResponse)
  })
})
