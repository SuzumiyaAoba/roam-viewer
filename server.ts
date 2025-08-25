import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getPort } from 'get-port-please'
import { apiClient } from './src/lib/api-client'
import type { CreateNodeRequest, UpdateNodeRequest } from './src/types/api'

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
    
    // Try to get refs from the API
    let refs: string[] = []
    
    try {
      refs = await apiClient.getNodeRefs(id)
      console.log('Successfully got refs from API for node:', id, refs)
    } catch (error) {
      console.log('No refs API available, trying to extract from content for node:', id)
      
      // Fallback: extract refs from frontmatter if API is not available
      if (node.content) {
        console.log('Node has content, looking for frontmatter...')
        const frontmatterMatch = node.content.match(/^---\s*\n([\s\S]*?)\n---/)
        if (frontmatterMatch) {
          const frontmatterText = frontmatterMatch[1]
          console.log('Found frontmatter:', frontmatterText.substring(0, 200))
          const refsMatch = frontmatterText.match(/refs?\s*:\s*(.+)/i)
          if (refsMatch) {
            console.log('Found refs match:', refsMatch[1])
            try {
              const refsValue = refsMatch[1].trim()
              if (refsValue.startsWith('[')) {
                refs = JSON.parse(refsValue)
                console.log('Parsed refs as JSON array:', refs)
              } else {
                refs = [refsValue.replace(/['"]/g, '')]
                console.log('Parsed refs as single string:', refs)
              }
            } catch (e) {
              console.log('Could not parse refs from frontmatter for node:', id, e)
            }
          } else {
            console.log('No refs field found in frontmatter')
          }
        } else {
          console.log('No frontmatter found in content')
        }
      } else {
        console.log('Node has no content')
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

const preferredPort = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT) : 3001;
const port = await getPort({ port: preferredPort, portRange: [3001, 3011] });

console.log(`🔥 Bun server starting on port ${port}`);

export default {
  port: port,
  fetch: app.fetch,
}