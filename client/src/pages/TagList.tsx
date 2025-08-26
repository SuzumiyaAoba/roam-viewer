import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useTags } from '../hooks/useNodes'
import { Layout } from '../components/Layout'

function TagCard({ tag, count }: { tag: string; count: number }) {
  return (
    <Link
      to={`/tags/${encodeURIComponent(tag)}`}
      className="block bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon icon="lucide:hash" className="text-blue-600" width={20} height={20} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">#{tag}</h3>
            <p className="text-sm text-gray-500">{count} node{count !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="text-gray-400">
          <Icon icon="lucide:chevron-right" width={20} height={20} />
        </div>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Icon icon="lucide:hash" className="text-gray-400" width={32} height={32} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No tags found</h3>
      <p className="text-gray-500 mb-6">
        Tags will appear here once you add them to your nodes.
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

export function TagListPage() {
  const { data: tags, isLoading, error } = useTags()

  if (isLoading) {
    return (
      <Layout title="Tags">
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <Icon icon="lucide:loader-2" className="animate-spin" width={20} height={20} />
            <span>Loading tags...</span>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Tags">
        <div className="text-center py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto">
            <strong>Error:</strong> Failed to load tags.
          </div>
        </div>
      </Layout>
    )
  }

  if (!tags || tags.length === 0) {
    return (
      <Layout title="Tags">
        <EmptyState />
      </Layout>
    )
  }

  return (
    <Layout title="Tags">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-600 mt-2">
            Browse {tags.length} tag{tags.length !== 1 ? 's' : ''} across your knowledge base
          </p>
        </div>
        <Link
          to="/nodes/new"
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <Icon icon="lucide:plus" width={16} height={16} />
          <span>Create Node</span>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tags.map((tagInfo) => (
          <TagCard 
            key={tagInfo.tag} 
            tag={tagInfo.tag} 
            count={tagInfo.count} 
          />
        ))}
      </div>
    </Layout>
  )
}