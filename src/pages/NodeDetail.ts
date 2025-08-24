import { NodeDetail, BacklinkNode } from '../types/api'

export function NodeDetailPage(node: NodeDetail, backlinks?: BacklinkNode[], forwardLinks?: BacklinkNode[]): string {
  return `
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-4">
          <a href="/nodes" class="text-gray-600 hover:text-gray-800">
            ← Back to Nodes
          </a>
          <h1 class="text-3xl font-bold text-gray-900">${escapeHtml(node.title)}</h1>
        </div>
        <div class="flex space-x-2">
          <a href="/nodes/${encodeURIComponent(node.id)}/edit" 
             class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
            Edit
          </a>
          <button 
            hx-delete="/api/nodes/${encodeURIComponent(node.id)}"
            hx-confirm="Are you sure you want to delete this node?"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors">
            Delete
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Content</h2>
            <div class="prose max-w-none">
              <pre class="whitespace-pre-wrap bg-gray-50 p-4 rounded-md text-sm">${escapeHtml(node.content || 'No content available.')}</pre>
            </div>
          </div>

          <!-- Backlinks -->
          ${backlinks && backlinks.length > 0 ? `
            <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Backlinks (${backlinks.length})</h2>
              <div class="space-y-3">
                ${backlinks.map(link => `
                  <div class="border-l-4 border-blue-200 pl-4">
                    <a href="/nodes/${encodeURIComponent(link.id)}" class="text-blue-600 hover:text-blue-800 font-medium">
                      ${escapeHtml(link.title)}
                    </a>
                    <p class="text-sm text-gray-500">${escapeHtml(link.file)}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Forward Links -->
          ${forwardLinks && forwardLinks.length > 0 ? `
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Forward Links (${forwardLinks.length})</h2>
              <div class="space-y-3">
                ${forwardLinks.map(link => `
                  <div class="border-l-4 border-green-200 pl-4">
                    <a href="/nodes/${encodeURIComponent(link.id)}" class="text-green-600 hover:text-green-800 font-medium">
                      ${escapeHtml(link.title)}
                    </a>
                    <p class="text-sm text-gray-500">${escapeHtml(link.file)}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Node Info -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Node Info</h2>
            <dl class="space-y-2 text-sm">
              <div>
                <dt class="font-medium text-gray-700">ID</dt>
                <dd class="text-gray-600 font-mono text-xs break-all">${escapeHtml(node.id)}</dd>
              </div>
              <div>
                <dt class="font-medium text-gray-700">File</dt>
                <dd class="text-gray-600">${escapeHtml(node.file)}</dd>
              </div>
              ${node.level !== undefined ? `
                <div>
                  <dt class="font-medium text-gray-700">Level</dt>
                  <dd class="text-gray-600">${node.level}</dd>
                </div>
              ` : ''}
              ${node.todo ? `
                <div>
                  <dt class="font-medium text-gray-700">TODO</dt>
                  <dd class="text-gray-600">${escapeHtml(node.todo)}</dd>
                </div>
              ` : ''}
            </dl>
          </div>

          <!-- Tags -->
          ${node.tags && node.tags.length > 0 ? `
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              <div class="flex flex-wrap gap-2">
                ${node.tags.map(tag => `
                  <span class="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    ${escapeHtml(tag)}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Aliases -->
          ${node.aliases && node.aliases.length > 0 ? `
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Aliases</h2>
              <div class="space-y-2">
                ${node.aliases.map(alias => `
                  <div class="text-sm text-gray-600">${escapeHtml(alias)}</div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- References -->
          ${node.refs && node.refs.length > 0 ? `
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">References</h2>
              <div class="space-y-2">
                ${node.refs.map(ref => `
                  <div class="text-sm text-gray-600">${escapeHtml(ref)}</div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Roam References -->
          ${node.roam_refs && node.roam_refs.length > 0 ? `
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Roam References</h2>
              <div class="space-y-2">
                ${node.roam_refs.map(ref => `
                  <div class="text-sm text-gray-600">${escapeHtml(ref)}</div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>

    <script>
      document.body.addEventListener('htmx:afterRequest', function(evt) {
        if (evt.detail.successful && evt.detail.xhr.status < 400) {
          if (evt.detail.requestConfig.verb === 'delete') {
            window.location.href = '/nodes';
          }
        }
      });
    </script>
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