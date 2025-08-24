import React from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useNode, useBacklinks, useForwardLinks, useDeleteNode } from '../hooks/useNodes'
import { Layout } from '../components/Layout'
import type { BacklinkNode } from '../types/api'

function BacklinkCard({ link }: { link: BacklinkNode }) {
  return (
    <div className="border-l-4 border-blue-200 pl-4">
      <Link 
        to={`/nodes/${encodeURIComponent(link.id)}`}
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        {link.title}
      </Link>
      <p className="text-sm text-gray-500">{link.file}</p>
    </div>
  )
}

function ForwardLinkCard({ link }: { link: BacklinkNode }) {
  return (
    <div className="border-l-4 border-green-200 pl-4">
      <Link 
        to={`/nodes/${encodeURIComponent(link.id)}`}
        className="text-green-600 hover:text-green-800 font-medium"
      >
        {link.title}
      </Link>
      <p className="text-sm text-gray-500">{link.file}</p>
    </div>
  )
}

export function NodeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { data: node, isLoading: nodeLoading, error: nodeError } = useNode(id!)
  const { data: backlinks } = useBacklinks(id!)
  const { data: forwardLinks } = useForwardLinks(id!)
  const deleteNodeMutation = useDeleteNode()

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      deleteNodeMutation.mutate(id!, {
        onSuccess: () => {
          navigate('/nodes')
        }
      })
    }
  }

  if (nodeLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading node...</p>
        </div>
      </Layout>
    )
  }

  if (nodeError || !node) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> Node not found or server error.
          </div>
          <Link 
            to="/nodes" 
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            ← Back to Nodes
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={node.title}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link 
            to="/nodes" 
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Nodes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{node.title}</h1>
        </div>
        <div className="flex space-x-2">
          <Link 
            to={`/nodes/${encodeURIComponent(node.id)}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Edit
          </Link>
          <button 
            onClick={handleDelete}
            disabled={deleteNodeMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {deleteNodeMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md text-sm">
                {node.content || 'No content available.'}
              </pre>
            </div>
          </div>

          {/* Backlinks */}
          {backlinks && backlinks.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Backlinks ({backlinks.length})
              </h2>
              <div className="space-y-3">
                {backlinks.map((link) => (
                  <BacklinkCard key={link.id} link={link} />
                ))}
              </div>
            </div>
          )}

          {/* Forward Links */}
          {forwardLinks && forwardLinks.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Forward Links ({forwardLinks.length})
              </h2>
              <div className="space-y-3">
                {forwardLinks.map((link) => (
                  <ForwardLinkCard key={link.id} link={link} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Node Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Node Info</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium text-gray-700">ID</dt>
                <dd className="text-gray-600 font-mono text-xs break-all">{node.id}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">File</dt>
                <dd className="text-gray-600">{node.file}</dd>
              </div>
              {node.level !== undefined && (
                <div>
                  <dt className="font-medium text-gray-700">Level</dt>
                  <dd className="text-gray-600">{node.level}</dd>
                </div>
              )}
              {node.todo && (
                <div>
                  <dt className="font-medium text-gray-700">TODO</dt>
                  <dd className="text-gray-600">{node.todo}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Tags */}
          {node.tags && node.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {node.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Aliases */}
          {node.aliases && node.aliases.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Aliases</h2>
              <div className="space-y-2">
                {node.aliases.map((alias, index) => (
                  <div key={index} className="text-sm text-gray-600">{alias}</div>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          {node.refs && node.refs.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">References</h2>
              <div className="space-y-2">
                {node.refs.map((ref, index) => (
                  <div key={index} className="text-sm text-gray-600">{ref}</div>
                ))}
              </div>
            </div>
          )}

          {/* Roam References */}
          {node.roam_refs && node.roam_refs.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Roam References</h2>
              <div className="space-y-2">
                {node.roam_refs.map((ref, index) => (
                  <div key={index} className="text-sm text-gray-600">{ref}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}