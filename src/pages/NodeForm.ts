import { NodeDetail } from '../types/api'

export function NodeCreatePage(): string {
  return NodeFormPage('Create Node', null, '/api/nodes', 'POST')
}

export function NodeEditPage(node: NodeDetail): string {
  return NodeFormPage('Edit Node', node, `/api/nodes/${encodeURIComponent(node.id)}`, 'PUT')
}

function NodeFormPage(title: string, node: NodeDetail | null, action: string, method: string): string {
  return `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">${title}</h1>
        <a href="/nodes" class="text-gray-600 hover:text-gray-800">
          ← Back to Nodes
        </a>
      </div>

      <div class="bg-white rounded-lg shadow-sm border p-6">
        <form 
          hx-${method.toLowerCase()}="${action}"
          hx-target="#form-container"
          hx-swap="outerHTML"
          ${method === 'PUT' ? 'hx-headers=\'{"X-HTTP-Method-Override": "PUT"}\'' : ''}
        >
          <div id="form-container">
            <div class="space-y-6">
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  required
                  value="${node?.title || ''}"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter node title"
                >
              </div>

              <div>
                <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea 
                  id="content" 
                  name="content" 
                  rows="12"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="Enter content in Markdown or Org format"
                >${node?.content || ''}</textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input 
                    type="text" 
                    id="tags" 
                    name="tags" 
                    value="${node?.tags?.join(', ') || ''}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tag1, tag2, tag3"
                  >
                  <p class="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                </div>

                <div>
                  <label for="aliases" class="block text-sm font-medium text-gray-700 mb-2">
                    Aliases
                  </label>
                  <input 
                    type="text" 
                    id="aliases" 
                    name="aliases" 
                    value="${node?.aliases?.join(', ') || ''}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="alias1, alias2"
                  >
                  <p class="text-xs text-gray-500 mt-1">Separate aliases with commas</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="refs" class="block text-sm font-medium text-gray-700 mb-2">
                    References
                  </label>
                  <input 
                    type="text" 
                    id="refs" 
                    name="refs" 
                    value="${node?.refs?.join(', ') || ''}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ref1, ref2"
                  >
                  <p class="text-xs text-gray-500 mt-1">Separate references with commas</p>
                </div>

                <div>
                  <label for="roam_refs" class="block text-sm font-medium text-gray-700 mb-2">
                    Roam References
                  </label>
                  <input 
                    type="text" 
                    id="roam_refs" 
                    name="roam_refs" 
                    value="${node?.roam_refs?.join(', ') || ''}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="roam_ref1, roam_ref2"
                  >
                  <p class="text-xs text-gray-500 mt-1">Separate roam references with commas</p>
                </div>
              </div>

              <div class="flex justify-end space-x-4 pt-6 border-t">
                <a href="/nodes" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md transition-colors">
                  Cancel
                </a>
                <button 
                  type="submit"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors">
                  ${node ? 'Update Node' : 'Create Node'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <script>
      document.body.addEventListener('htmx:afterRequest', function(evt) {
        if (evt.detail.successful && evt.detail.xhr.status < 400) {
          // Redirect to nodes list on success
          if (evt.detail.requestConfig.path.includes('/api/nodes')) {
            window.location.href = '/nodes';
          }
        }
      });
    </script>
  `
}