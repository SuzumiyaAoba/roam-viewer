import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getPort } from 'get-port-please'
import { apiClient } from './client/src/lib/api-client'
import type { CreateNodeRequest, UpdateNodeRequest } from './client/src/types/api'

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
    return c.json({ error: 'Failed to fetch nodes' }, 500)
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
    return c.json({ error: 'Node not found' }, 404)
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
    return c.json({ error: 'Failed to fetch backlinks' }, 500)
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
    return c.json({ error: 'Failed to fetch forward links' }, 500)
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
    
    // Get all nodes first, then filter by tag
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