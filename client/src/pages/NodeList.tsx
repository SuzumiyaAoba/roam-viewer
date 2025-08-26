import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useLocalStorage } from 'react-use'
import { useNodes, useSearchNodes, useDeleteNode } from '../hooks/useNodes'
import { Layout } from '../components/Layout'
import { NodeCard, NodeCardCompact } from '../components/design-system/NodeCard'
import { Button } from '../components/design-system/Button'
import { cn } from '../components/design-system/utils'
import type { Node } from '../types/api'

type ViewMode = 'grid' | 'list' | 'table'


export function NodeListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('node-list-view-mode', 'grid')
  const navigate = useNavigate()
  
  const { data: nodes, isLoading: nodesLoading, error: nodesError } = useNodes()
  const { data: searchResults, isLoading: searchLoading } = useSearchNodes(debouncedQuery)
  const deleteNodeMutation = useDeleteNode()

  // Initialize state from URL parameters
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag')
    const searchFromUrl = searchParams.get('search')
    
    if (tagFromUrl) {
      setSelectedTag(decodeURIComponent(tagFromUrl))
    }
    
    if (searchFromUrl) {
      const decodedSearch = decodeURIComponent(searchFromUrl)
      setSearchQuery(decodedSearch)
      setDebouncedQuery(decodedSearch)
    }
  }, []) // Run only on mount

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update URL when debounced query changes (but not on initial load)
  useEffect(() => {
    const isInitialLoad = searchParams.get('search') && debouncedQuery === decodeURIComponent(searchParams.get('search')!)
    if (!isInitialLoad) {
      updateURLParams(undefined, debouncedQuery)
    }
  }, [debouncedQuery])

  // Handle browser back/forward navigation
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag')
    const searchFromUrl = searchParams.get('search')
    
    // Update selectedTag if URL parameter changed
    if (tagFromUrl && tagFromUrl !== selectedTag) {
      setSelectedTag(decodeURIComponent(tagFromUrl))
    } else if (!tagFromUrl && selectedTag) {
      setSelectedTag(null)
    }
    
    // Update searchQuery if URL parameter changed
    if (searchFromUrl) {
      const decodedSearch = decodeURIComponent(searchFromUrl)
      if (decodedSearch !== searchQuery) {
        setSearchQuery(decodedSearch)
      }
    } else if (!searchFromUrl && searchQuery) {
      setSearchQuery('')
    }
  }, [searchParams])

  // Filter nodes based on search query and selected tag
  const getFilteredNodes = (): Node[] => {
    let filteredNodes = debouncedQuery 
      ? (searchResults?.nodes || []) 
      : (nodes || [])
    
    // Apply tag filter if a tag is selected
    if (selectedTag) {
      filteredNodes = filteredNodes.filter(node => 
        node.tags?.includes(selectedTag)
      )
    }
    
    return filteredNodes
  }
  
  const displayNodes = getFilteredNodes()

  const isLoading = nodesLoading || searchLoading
  const error = nodesError

  const handleDelete = (id: string) => {
    deleteNodeMutation.mutate(id)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled by debounced effect
  }

  // Update URL parameters helper
  const updateURLParams = (newTag?: string | null, newSearch?: string) => {
    const newParams = new URLSearchParams(searchParams)
    
    if (newTag !== undefined) {
      if (newTag === null) {
        newParams.delete('tag')
      } else {
        newParams.set('tag', encodeURIComponent(newTag))
      }
    }
    
    if (newSearch !== undefined) {
      if (newSearch === '') {
        newParams.delete('search')
      } else {
        newParams.set('search', encodeURIComponent(newSearch))
      }
    }
    
    setSearchParams(newParams, { replace: true })
  }

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      // If clicking the same tag, clear the filter
      setSelectedTag(null)
      updateURLParams(null)
    } else {
      // Set new tag filter
      setSelectedTag(tag)
      updateURLParams(tag)
    }
  }

  const clearFilters = () => {
    setSelectedTag(null)
    setSearchQuery('')
    setDebouncedQuery('')
    // Clear all URL parameters
    setSearchParams({}, { replace: true })
  }

  const renderNodes = () => {
    if (!displayNodes.length) return null

    switch (viewMode) {
      case 'grid':
        return (
          <div className="grid gap-6 md:grid-cols-2">
            {displayNodes.map((node) => (
              <NodeCard 
                key={node.id} 
                title={node.title}
                file={node.file}
                tags={node.tags}
                todo={node.todo}
                onCardClick={() => navigate(`/nodes/${node.id}`)}
                onEdit={() => navigate(`/nodes/${node.id}/edit`)}
                onDelete={() => {
                  if (window.confirm('Are you sure you want to delete this node?')) {
                    handleDelete(node.id)
                  }
                }}
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        )
      
      case 'list':
        return (
          <div className="space-y-4">
            {displayNodes.map((node) => (
              <NodeCardCompact 
                key={node.id} 
                title={node.title}
                file={node.file}
                tags={node.tags}
                todo={node.todo}
                onCardClick={() => navigate(`/nodes/${node.id}`)}
                onEdit={() => navigate(`/nodes/${node.id}/edit`)}
                onDelete={() => {
                  if (window.confirm('Are you sure you want to delete this node?')) {
                    handleDelete(node.id)
                  }
                }}
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        )
      
      case 'table':
        return (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayNodes.map((node) => (
                  <tr key={node.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/nodes/${node.id}`)}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 text-left"
                      >
                        {node.title}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 font-mono">{node.file}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {node.tags?.slice(0, 3).map((tag) => (
                          <button
                            key={tag}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTagClick(tag)
                            }}
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-colors hover:bg-blue-200",
                              selectedTag === tag 
                                ? "bg-blue-600 text-white" 
                                : "bg-blue-100 text-blue-800"
                            )}
                          >
                            {tag}
                          </button>
                        ))}
                        {node.tags && node.tags.length > 3 && (
                          <span className="text-xs text-gray-400">+{node.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/nodes/${node.id}/edit`)}
                          className="h-8 w-8 p-0"
                          title="Edit node"
                        >
                          <Icon icon="lucide:edit" width={14} height={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this node?')) {
                              handleDelete(node.id)
                            }
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Delete node"
                        >
                          <Icon icon="lucide:trash-2" width={14} height={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nodes</h1>
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="px-3 py-2"
              title="Grid view"
            >
              <Icon icon="lucide:grid-3x3" width={16} height={16} />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="px-3 py-2"
              title="List view"
            >
              <Icon icon="lucide:list" width={16} height={16} />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              onClick={() => setViewMode('table')}
              className="px-3 py-2"
              title="Table view"
            >
              <Icon icon="lucide:table" width={16} height={16} />
            </Button>
          </div>
          <Link 
            to="/nodes/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Create New Node
          </Link>
        </div>
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
          </div>
        </form>

        {/* Active Filters */}
        {(selectedTag || debouncedQuery) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              {selectedTag && (
                <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <span>Tag: {selectedTag}</span>
                  <button
                    onClick={() => {
                      setSelectedTag(null)
                      updateURLParams(null)
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <Icon icon="lucide:x" width={14} height={14} />
                  </button>
                </div>
              )}
              {debouncedQuery && (
                <div className="flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  <span>Search: "{debouncedQuery}"</span>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setDebouncedQuery('')
                      updateURLParams(undefined, '')
                    }}
                    className="ml-2 text-gray-600 hover:text-gray-800"
                  >
                    <Icon icon="lucide:x" width={14} height={14} />
                  </button>
                </div>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
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
            {selectedTag && <p className="mt-2">No nodes found with tag "{selectedTag}".</p>}
            {(debouncedQuery || selectedTag) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-600 hover:text-blue-800 underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && displayNodes.length > 0 && renderNodes()}
      </div>
    </Layout>
  )
}