import { Link, useParams, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useNodesByTag } from '../../entities/node'
import { Layout } from '../../widgets/layout'
import { NodeCard } from '../../shared/ui'
import type { Node } from '../../entities/node'

function EmptyState({ tag }: { tag: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Icon icon="lucide:hash" className="text-gray-400" width={32} height={32} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No nodes found with tag "#{tag}"</h3>
      <p className="text-gray-500 mb-6">
        Create a new node and add the "#{tag}" tag to see it here.
      </p>
      <Link
        to="/nodes/new"
        className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
      >
        <Icon icon="lucide:plus" width={16} height={16} />
        <span>Create Node</span>
      </Link>
    </div>
  )
}

export function TagDetailPage() {
  const { tag } = useParams<{ tag: string }>()
  const navigate = useNavigate()
  const { data: nodes, isLoading, error } = useNodesByTag(tag!)

  if (isLoading) {
    return (
      <Layout title={`Tag: #${tag}`}>
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <Icon icon="lucide:loader-2" className="animate-spin" width={20} height={20} />
            <span>Loading nodes...</span>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title={`Tag: #${tag}`}>
        <div className="text-center py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto">
            <strong>Error:</strong> Failed to load nodes for tag "#{tag}".
          </div>
          <Link 
            to="/tags" 
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            ← Back to Tags
          </Link>
        </div>
      </Layout>
    )
  }

  if (!nodes || nodes.length === 0) {
    return (
      <Layout title={`Tag: #${tag}`}>
        <div className="mb-8">
          <Link 
            to="/tags" 
            className="text-gray-600 hover:text-gray-800 inline-flex items-center space-x-1"
          >
            <Icon icon="lucide:arrow-left" width={16} height={16} />
            <span>Back to Tags</span>
          </Link>
        </div>
        <EmptyState tag={tag!} />
      </Layout>
    )
  }

  return (
    <Layout title={`Tag: #${tag}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link 
            to="/tags" 
            className="text-gray-600 hover:text-gray-800 inline-flex items-center space-x-1 mb-4"
          >
            <Icon icon="lucide:arrow-left" width={16} height={16} />
            <span>Back to Tags</span>
          </Link>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon icon="lucide:hash" className="text-blue-600" width={24} height={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">#{tag}</h1>
          </div>
          <p className="text-gray-600">
            {nodes.length} node{nodes.length !== 1 ? 's' : ''} tagged with #{tag}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/nodes?tag=${encodeURIComponent(tag!)}`}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 px-4 py-2 rounded-md transition-colors"
          >
            <Icon icon="lucide:list" width={16} height={16} />
            <span>View All Nodes</span>
          </Link>
          <Link
            to="/nodes/new"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <Icon icon="lucide:plus" width={16} height={16} />
            <span>Create Node</span>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {nodes.map((node: Node) => (
          <NodeCard
            key={node.id}
            title={node.title}
            file={node.file}
            tags={node.tags}
            onCardClick={() => navigate(`/nodes/${node.id}`)}
          />
        ))}
      </div>
    </Layout>
  )
}