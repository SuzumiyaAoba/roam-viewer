import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getPort } from 'get-port-please'
import type { CreateNodeRequest, UpdateNodeRequest } from './client/src/types/api'

// Direct md-roam API client for server-side use
class MdRoamApiClient {
  private baseUrl: string
  private timeout: number

  constructor(baseUrl: string = 'http://localhost:8080', timeout: number = 30000) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.timeout = timeout
  }

  async request<T>(endpoint: string, options: RequestInit = {}, retries: number = 2): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    // Use longer timeout for POST/PUT operations (node creation/updates can be slow)
    const requestTimeout = (options.method === 'POST' || options.method === 'PUT') ? 60000 : this.timeout
    
    if (options.method === 'POST' || options.method === 'PUT') {
      console.log(`Making ${options.method} request to:`, url, `(timeout: ${requestTimeout}ms)`)
      if (options.body) {
        console.log('Request body:', options.body)
      }
    }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout)

    const config: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await response.json()
      } else {
        return await response.text() as unknown as T
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      // Retry only on network errors, not on 404 or other HTTP errors
      // Don't retry AbortError for POST/PUT operations as they might have succeeded
      const shouldRetry = retries > 0 && (
        (error.name === 'AbortError' && options.method !== 'POST' && options.method !== 'PUT') || 
        error.message.includes('socket connection was closed') ||
        error.message.includes('fetch failed') ||
        error.message.includes('ECONNREFUSED')
      ) && !error.message.includes('HTTP 404') && !error.message.includes('HTTP 400')
      
      if (shouldRetry) {
        console.warn(`Request failed, retrying... (${retries} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return this.request<T>(endpoint, options, retries - 1)
      }
      
      throw error
    }
  }

  async getNodes() {
    const result = await this.request<any>('/nodes')
    // New API format: {"status":"success", "nodes":[...], "count":N}
    if (result && result.status === 'success' && Array.isArray(result.nodes)) {
      return result.nodes
    }
    // Fallback for old format
    if (Array.isArray(result)) {
      return result
    }
    return []
  }

  async getNode(id: string) {
    const result = await this.request<any>(`/nodes/${encodeURIComponent(id)}/content`)
    // New API format: {"status":"success", "node_id":"...", "title":"...", "content":"...", ...}
    if (result && result.status === 'success') {
      // Convert new format to expected format
      return {
        id: result.node_id,
        title: result.title,
        file: result.file_path,
        content: result.content,
        tags: result.tags,
        aliases: result.aliases,
        level: result.level,
        // Add other properties as needed
      }
    }
    // Return as-is for backward compatibility
    return result
  }

  async getNodeRefs(id: string) {
    try {
      const result = await this.request<any>(`/nodes/${encodeURIComponent(id)}/refs`)
      if (result && Array.isArray(result.refs)) {
        return result.refs
      } else if (Array.isArray(result)) {
        return result
      }
    } catch (error) {
      // If refs endpoint doesn't exist, return empty array silently
      if (error.message.includes('HTTP 404')) {
        console.log(`Refs endpoint not available for node ${id}, skipping refs`)
        return []
      }
      throw error
    }
    return []
  }

  async getBacklinks(id: string) {
    try {
      const result = await this.request<any>(`/nodes/${encodeURIComponent(id)}/backlinks`)
      if (Array.isArray(result)) {
        return result
      } else if (result && Array.isArray(result.backlinks)) {
        return result.backlinks
      }
    } catch (error) {
      // If backlinks endpoint doesn't exist, return empty array silently
      if (error.message.includes('HTTP 404')) {
        console.log(`Backlinks endpoint not available for node ${id}, skipping backlinks`)
        return []
      }
      throw error
    }
    return []
  }

  async getForwardLinks(id: string) {
    try {
      const result = await this.request<any>(`/nodes/${encodeURIComponent(id)}/links`)
      if (Array.isArray(result)) {
        return result
      } else if (result && Array.isArray(result.links)) {
        return result.links
      }
    } catch (error) {
      // If links endpoint doesn't exist, return empty array silently
      if (error.message.includes('HTTP 404')) {
        console.log(`Forward links endpoint not available for node ${id}, skipping forward links`)
        return []
      }
      throw error
    }
    return []
  }

  async searchNodes(query: string) {
    const result = await this.request<any>(`/search/${encodeURIComponent(query)}`)
    // New API format: {"status":"success", "query":"...", "nodes":[...], "count":N}
    if (result && result.status === 'success' && Array.isArray(result.nodes)) {
      return {
        nodes: result.nodes,
        total: result.count
      }
    }
    // Return as-is for backward compatibility
    return result
  }

  async createNode(nodeData: CreateNodeRequest) {
    console.log('Creating node with data:', JSON.stringify(nodeData, null, 2))
    
    // Remove refs field as md-roam API doesn't support it in node creation
    // Keep file_type as it's supported by md-roam API
    const { refs, ...apiNodeData } = nodeData
    console.log('Sending to md-roam API (without refs):', JSON.stringify(apiNodeData, null, 2))
    
    return this.request<any>('/nodes', {
      method: 'POST',
      body: JSON.stringify(apiNodeData),
    })
  }

  async updateNode(id: string, nodeData: UpdateNodeRequest) {
    console.log('Updating node with data:', JSON.stringify(nodeData, null, 2))
    
    // Remove refs field as md-roam API doesn't support it in node updates
    const { refs, ...apiNodeData } = nodeData
    console.log('Sending to md-roam API (without refs):', JSON.stringify(apiNodeData, null, 2))
    
    return this.request<any>(`/nodes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(apiNodeData),
    })
  }

  async deleteNode(id: string) {
    return this.request<void>(`/nodes/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  }

  async getTags() {
    const result = await this.request<any>('/tags')
    // New API format: {"status":"success", "tags":[...], "total_tags":N}
    if (result && result.status === 'success' && Array.isArray(result.tags)) {
      // Convert new format to expected format, mapping tag objects to {tag, count}
      return result.tags.map(tagObj => ({
        tag: tagObj.tag,
        count: tagObj.count
      }))
    }
    // Return as-is for backward compatibility
    return result
  }
}

const apiClient = new MdRoamApiClient(process.env.MD_ROAM_API_URL || 'http://localhost:8080')

const app = new Hono()

// Enable CORS for React development server
app.use('/*', cors())

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes

// Get all nodes
app.get('/api/nodes', async (c) => {
  try {
    const apiResult = await apiClient.getNodes()
    const nodes = Array.isArray(apiResult) ? apiResult : []
    return c.json(nodes)
  } catch (error) {
    console.error('Error fetching nodes:', error)
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isConnectionError = errorMessage.includes('socket connection was closed') || 
                             errorMessage.includes('Network error') ||
                             errorMessage.includes('ECONNREFUSED')
    
    if (isConnectionError) {
      console.error('Connection issue detected. Please ensure md-roam API server is running on port 8080')
      return c.json({ 
        error: 'Unable to connect to md-roam API server',
        details: 'Please ensure the md-roam API server is running on port 8080',
        suggestion: 'Check if the md-roam API server is started and accessible'
      }, 503)
    }
    
    return c.json({ 
      error: 'Failed to fetch nodes', 
      details: errorMessage 
    }, 500)
  }
})

// Get single node
app.get('/api/nodes/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const node = await apiClient.getNode(id)
    
    // Try to get refs from the API first
    let refs: string[] = []
    
    try {
      const apiRefs = await apiClient.getNodeRefs(id)
      console.log('Got refs from API:', apiRefs)
      
      // Normalize refs format - handle both string and object formats
      if (apiRefs && apiRefs.length > 0) {
        refs = apiRefs.map(refItem => {
          if (typeof refItem === 'string') {
            return refItem
          } else if (typeof refItem === 'object' && refItem.ref && refItem.type) {
            return `${refItem.type}:${refItem.ref}`
          } else if (typeof refItem === 'object' && refItem.ref) {
            return refItem.ref
          } else {
            return String(refItem)
          }
        })
        console.log('Normalized refs:', refs)
      }
      
      // If API returns empty refs, try fallback
      if (refs.length === 0) {
        console.log('API returned empty refs, trying fallback for node:', id);
        throw new Error('Empty refs, using fallback')
      }
    } catch (error) {
      console.log('API refs call failed or empty, using fallback for node:', id);
      // Fallback: extract refs from frontmatter if API fails
      if (node.content) {
        const frontmatterMatch = node.content.match(/^---\s*\n([\s\S]*?)\n---/)
        if (frontmatterMatch) {
          const frontmatterText = frontmatterMatch[1]
          const refsMatch = frontmatterText.match(/refs?\s*:\s*(.+)/i)
          if (refsMatch) {
            try {
              const refsValue = refsMatch[1].trim()
              if (refsValue.startsWith('[')) {
                refs = JSON.parse(refsValue)
              } else {
                refs = [refsValue.replace(/['"]/g, '')]
              }
              console.log('Parsed refs from frontmatter:', refs)
            } catch (e) {
              console.log('Failed to parse refs from frontmatter:', e.message)
            }
          }
        }
      }
    }
    
    // Merge the additional data with the node response
    const enrichedNode = {
      ...node,
      refs: refs.length > 0 ? refs : undefined
    }
    
    return c.json(enrichedNode)
  } catch (error) {
    console.error('Error fetching node:', error)
    
    // Return appropriate status code based on error type
    if (error.message.includes('HTTP 404')) {
      return c.json({ error: 'Node not found', nodeId: c.req.param('id') }, 404)
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isConnectionError = errorMessage.includes('socket connection was closed') || 
                             errorMessage.includes('Network error') ||
                             errorMessage.includes('ECONNREFUSED')
    
    if (isConnectionError) {
      return c.json({ 
        error: 'Unable to connect to md-roam API server',
        details: 'Please ensure the md-roam API server is running on port 8080'
      }, 503)
    }
    
    return c.json({ 
      error: 'Failed to fetch node', 
      details: errorMessage 
    }, 500)
  }
})

// Get node backlinks
app.get('/api/nodes/:id/backlinks', async (c) => {
  try {
    const id = c.req.param('id')
    const backlinks = await apiClient.getBacklinks(id)
    return c.json(backlinks)
  } catch (error) {
    console.error('Error fetching backlinks:', error)
    
    // Return appropriate status based on error type
    if (error.message.includes('HTTP 404')) {
      return c.json({ error: 'Backlinks endpoint not available', backlinks: [] }, 200)
    }
    
    return c.json({ 
      error: 'Failed to fetch backlinks', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get node forward links
app.get('/api/nodes/:id/links', async (c) => {
  try {
    const id = c.req.param('id')
    const forwardLinks = await apiClient.getForwardLinks(id)
    return c.json(forwardLinks)
  } catch (error) {
    console.error('Error fetching forward links:', error)
    
    // Return appropriate status based on error type
    if (error.message.includes('HTTP 404')) {
      return c.json({ error: 'Forward links endpoint not available', links: [] }, 200)
    }
    
    return c.json({ 
      error: 'Failed to fetch forward links', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Search nodes
app.get('/api/search/:query', async (c) => {
  try {
    const query = c.req.param('query')
    const results = await apiClient.searchNodes(query)
    return c.json(results)
  } catch (error) {
    console.error('Error searching nodes:', error)
    return c.json({ error: 'Search failed' }, 500)
  }
})

// Create node
app.post('/api/nodes', async (c) => {
  try {
    const nodeRequest = await c.req.json<CreateNodeRequest>()
    const newNode = await apiClient.createNode(nodeRequest)
    return c.json(newNode, 201)
  } catch (error) {
    console.error('Error creating node:', error)
    return c.json({ error: 'Failed to create node' }, 500)
  }
})

// Update node
app.put('/api/nodes/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const nodeRequest = await c.req.json<UpdateNodeRequest>()
    const updatedNode = await apiClient.updateNode(id, nodeRequest)
    return c.json(updatedNode)
  } catch (error) {
    console.error('Error updating node:', error)
    return c.json({ error: 'Failed to update node' }, 500)
  }
})

// Delete node
app.delete('/api/nodes/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await apiClient.deleteNode(id)
    return c.text('', 204)
  } catch (error) {
    console.error('Error deleting node:', error)
    return c.json({ error: 'Failed to delete node' }, 500)
  }
})

// Get all tags
app.get('/api/tags', async (c) => {
  try {
    const tags = await apiClient.getTags()
    return c.json(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return c.json({ error: 'Failed to fetch tags' }, 500)
  }
})

// Search nodes by tag  
app.get('/api/search/tag/:tag', async (c) => {
  try {
    const tag = c.req.param('tag')
    
    // Try to use the new tags API with node_ids first
    try {
      const tagsResult = await apiClient.request<any>('/tags')
      if (tagsResult && tagsResult.status === 'success' && Array.isArray(tagsResult.tags)) {
        // Find the specific tag and get its node_ids
        const tagInfo = tagsResult.tags.find(t => t.tag === tag)
        if (tagInfo && Array.isArray(tagInfo.node_ids)) {
          // Get all nodes and filter by the node_ids
          const allNodes = await apiClient.getNodes()
          const taggedNodes = allNodes.filter(node => tagInfo.node_ids.includes(node.id))
          
          console.log(`Found ${taggedNodes.length} nodes for tag: ${tag} (using node_ids)`)
          return c.json(taggedNodes)
        }
      }
    } catch (error) {
      console.log(`New tags API not available, falling back to node filtering for tag: ${tag}`)
    }
    
    // Fallback: Get all nodes first, then filter by tag
    const allNodes = await apiClient.getNodes()
    
    // Filter nodes that have the specific tag
    const taggedNodes = allNodes.filter(node => 
      node.tags?.includes(tag) || 
      node.title?.toLowerCase().includes(tag.toLowerCase()) ||
      node.aliases?.some(alias => alias.toLowerCase().includes(tag.toLowerCase()))
    )
    
    console.log(`Found ${taggedNodes.length} nodes for tag: ${tag}`)
    return c.json(taggedNodes)
  } catch (error) {
    console.error('Error searching nodes by tag:', error)
    return c.json({ error: 'Failed to search nodes by tag' }, 500)
  }
})

const preferredPort = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT) : 3001;
const port = await getPort({ port: preferredPort, portRange: [3001, 3011] });

console.log(`🔥 Bun server starting on port ${port}`);

export default {
  port: port,
  fetch: app.fetch,
}