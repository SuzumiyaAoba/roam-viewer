import { Node } from '../types/api'

export function NodeListPage(nodes: Node[], searchQuery?: string): string {
  // Ensure nodes is an array and filter out any invalid nodes
  const validNodes = Array.isArray(nodes) ? nodes.filter(node => node && node.id && node.title) : []
  
  const nodeItems = validNodes.map(node => `
    <div class="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            <a href="/nodes/${encodeURIComponent(node.id)}" class="hover:text-blue-600">
              ${escapeHtml(node.title)}
            </a>
          </h3>
          <p class="text-sm text-gray-500 mb-2">
            File: ${escapeHtml(node.file)}
          </p>
          ${node.tags && node.tags.length > 0 ? `
            <div class="flex flex-wrap gap-2 mb-3">
              ${node.tags.map(tag => `
                <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  ${escapeHtml(tag)}
                </span>
              `).join('')}
            </div>
          ` : ''}
          ${node.todo ? `
            <span class="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mb-2">
              TODO: ${escapeHtml(node.todo)}
            </span>
          ` : ''}
        </div>
        <div class="flex space-x-2 ml-4">
          <a href="/nodes/${encodeURIComponent(node.id)}/edit" 
             class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm transition-colors">
            Edit
          </a>
          <button 
            hx-delete="/api/nodes/${encodeURIComponent(node.id)}"
            hx-confirm="Are you sure you want to delete this node?"
            hx-target="closest .bg-white"
            hx-swap="outerHTML"
            class="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  `).join('')

  return `
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Nodes</h1>
        <a href="/nodes/new" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
          Create New Node
        </a>
      </div>

      <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <form hx-get="/nodes" hx-target="#node-list" hx-swap="outerHTML">
          <div class="flex gap-4">
            <input 
              type="text" 
              name="search" 
              placeholder="Search nodes..." 
              value="${searchQuery || ''}"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <button 
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors">
              Search
            </button>
            <a href="/nodes" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md transition-colors">
              Clear
            </a>
          </div>
        </form>
      </div>

      <div id="node-list" class="space-y-4">
        ${validNodes.length > 0 ? nodeItems : `
          <div class="text-center py-12 text-gray-500">
            <p class="text-lg">No nodes found.</p>
            ${searchQuery ? `<p class="mt-2">Try a different search term.</p>` : ''}
          </div>
        `}
      </div>
    </div>
  `
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}