import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNodes, useSearchNodes, useDeleteNode } from '../hooks/useNodes'
import { Layout } from '../components/Layout.simple'
import type { Node } from '../types/api'

function NodeCard({ node, onDelete }: { node: Node; onDelete: (id: string) => void }) {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      onDelete(node.id)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            <Link 
              to={`/nodes/${encodeURIComponent(node.id)}`}
              className="hover:text-blue-600"
            >
              {node.title}
            </Link>
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            File: {node.file}
          </p>
          {node.tags && node.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {node.tags.map((tag) => (
                <span 
                  key={tag}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {node.todo && (
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mb-2">
              TODO: {node.todo}
            </span>
          )}
        </div>
        <div className="flex space-x-2 ml-4">
          <Link 
            to={`/nodes/${encodeURIComponent(node.id)}/edit`}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm transition-colors"
          >
            Edit
          </Link>
          <button 
            onClick={handleDelete}
            className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export function NodeListPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  
  const { data: nodes, isLoading: nodesLoading, error: nodesError } = useNodes()
  const { data: searchResults, isLoading: searchLoading } = useSearchNodes(debouncedQuery)
  const deleteNodeMutation = useDeleteNode()

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const displayNodes = debouncedQuery 
    ? (searchResults?.nodes || []) 
    : (nodes || [])

  const isLoading = nodesLoading || searchLoading
  const error = nodesError

  const handleDelete = (id: string) => {
    deleteNodeMutation.mutate(id)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled by debounced effect
  }

  const clearSearch = () => {
    setSearchQuery('')
    setDebouncedQuery('')
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nodes</h1>
        <Link 
          to="/nodes/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Create New Node
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <form onSubmit={handleSearch}>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Search nodes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Search
            </button>
            <button 
              type="button"
              onClick={clearSearch}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md transition-colors"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> Failed to fetch nodes. Please check if the server is running.
            <br />
            <small>Error details: {error instanceof Error ? error.message : 'Unknown error'}</small>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading nodes...</p>
          </div>
        )}

        {!isLoading && !error && displayNodes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No nodes found.</p>
            {debouncedQuery && <p className="mt-2">Try a different search term.</p>}
          </div>
        )}

        {!isLoading && !error && displayNodes.length > 0 && 
          displayNodes.map((node) => (
            <NodeCard 
              key={node.id} 
              node={node} 
              onDelete={handleDelete}
            />
          ))
        }
      </div>
    </Layout>
  )
}