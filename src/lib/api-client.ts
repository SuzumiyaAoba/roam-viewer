import type {
  Node,
  NodeDetail,
  FileInfo,
  SearchResult,
  Tag,
  BacklinkNode,
  ApiResponse,
  CreateNodeRequest,
  UpdateNodeRequest,
} from '../types/api'

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class MdRoamApiClient {
  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:8080') {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response
        )
      }

      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await response.json()
      } else {
        return await response.text() as unknown as T
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // File Operations
  async getFiles(): Promise<FileInfo[]> {
    return this.request<FileInfo[]>('/files')
  }

  async getRawFiles(): Promise<string[]> {
    return this.request<string[]>('/files/raw')
  }

  async getFileContent(filepath: string): Promise<string> {
    const encodedPath = encodeURIComponent(filepath)
    return this.request<string>(`/files/${encodedPath}`)
  }

  // Node Operations
  async getNodes(): Promise<Node[]> {
    const result = await this.request<any>('/nodes')
    
    // Handle new API response format
    if (result && Array.isArray(result.nodes)) {
      return result.nodes
    } else if (Array.isArray(result)) {
      return result
    } else if (result && Array.isArray(result.data)) {
      return result.data
    }
    
    return []
  }

  async getNode(id: string): Promise<NodeDetail> {
    const result = await this.request<any>(`/nodes/${encodeURIComponent(id)}/content`)
    
    // Handle new API response format
    if (result && result.status === 'success') {
      // The response is the complete node data, return it as-is
      return {
        id: result.node_id,
        title: result.title,
        file: result.file_path,
        content: result.content,
        level: result.level,
        tags: result.tags || [],
        aliases: result.aliases || [],
        // Other fields as needed
      }
    } else if (result && result.content !== undefined) {
      // Fallback for older format
      return result
    }
    
    throw new ApiError('Invalid node response format')
  }

  async createNode(nodeData: CreateNodeRequest): Promise<NodeDetail> {
    return this.request<NodeDetail>('/nodes', {
      method: 'POST',
      body: JSON.stringify(nodeData),
    })
  }

  async updateNode(id: string, nodeData: UpdateNodeRequest): Promise<NodeDetail> {
    return this.request<NodeDetail>(`/nodes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(nodeData),
    })
  }

  async deleteNode(id: string): Promise<void> {
    return this.request<void>(`/nodes/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  }

  // Search Operations
  async searchNodes(query: string): Promise<SearchResult> {
    return this.request<SearchResult>(`/search/${encodeURIComponent(query)}`)
  }

  async searchNodesByTitle(title: string): Promise<Node[]> {
    return this.request<Node[]>(`/search/title/${encodeURIComponent(title)}`)
  }

  async searchNodesByTag(tag: string): Promise<Node[]> {
    return this.request<Node[]>(`/search/tag/${encodeURIComponent(tag)}`)
  }

  async searchNodesByAlias(alias: string): Promise<Node[]> {
    return this.request<Node[]>(`/search/alias/${encodeURIComponent(alias)}`)
  }

  async searchNodesByRef(ref: string): Promise<Node[]> {
    return this.request<Node[]>(`/search/ref/${encodeURIComponent(ref)}`)
  }

  // Relationships
  async getBacklinks(id: string): Promise<BacklinkNode[]> {
    const result = await this.request<any>(`/nodes/${encodeURIComponent(id)}/backlinks`)
    
    // Handle different response formats
    if (Array.isArray(result)) {
      return result
    } else if (result && Array.isArray(result.backlinks)) {
      return result.backlinks
    } else if (result && Array.isArray(result.data)) {
      return result.data
    }
    
    return []
  }

  async getForwardLinks(id: string): Promise<BacklinkNode[]> {
    const result = await this.request<any>(`/nodes/${encodeURIComponent(id)}/links`)
    
    // Handle different response formats
    if (Array.isArray(result)) {
      return result
    } else if (result && Array.isArray(result.links)) {
      return result.links
    } else if (result && Array.isArray(result.data)) {
      return result.data
    }
    
    return []
  }

  async getNodeAliases(id: string): Promise<string[]> {
    return this.request<string[]>(`/nodes/${encodeURIComponent(id)}/aliases`)
  }

  async getNodeRefs(id: string): Promise<string[]> {
    const result = await this.request<any>(`/nodes/${encodeURIComponent(id)}/refs`)
    
    // Handle new API response format
    if (result && Array.isArray(result.refs)) {
      return result.refs
    } else if (Array.isArray(result)) {
      return result
    }
    
    return []
  }

  // Metadata Collections
  async getTags(): Promise<Tag[]> {
    return this.request<Tag[]>('/tags')
  }

  async getAliases(): Promise<string[]> {
    return this.request<string[]>('/aliases')
  }

  async getRefs(): Promise<string[]> {
    return this.request<string[]>('/refs')
  }

  async getTitles(): Promise<string[]> {
    return this.request<string[]>('/titles')
  }

  // Utility Methods
  setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/$/, '')
  }

  getBaseUrl(): string {
    return this.baseUrl
  }
}

// Default instance with configuration
export const apiClient = new MdRoamApiClient(
  process.env.MD_ROAM_API_URL || 'http://localhost:8080'
)