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
    return c.json(node)
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