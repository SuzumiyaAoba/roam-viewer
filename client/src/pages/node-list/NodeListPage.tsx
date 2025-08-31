import { Icon } from "@iconify/react";
import type React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLocalStorage } from "react-use";
import type { Node } from "../../entities/node";
import { useDeleteNode, useNodes, useSearchNodes } from "../../entities/node";
import { useTags } from "../../entities/tag";
import { Button, cn, NodeCard, NodeCardCompact } from "../../shared/ui";
import { Layout } from "../../widgets/layout";

type ViewMode = "grid" | "list" | "table";

export function NodeListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>("node-list-view-mode", "grid");
  const navigate = useNavigate();

  const { data: nodes, isLoading: nodesLoading, error: nodesError } = useNodes();
  const { data: searchResults, isLoading: searchLoading } = useSearchNodes(debouncedQuery);
  const { data: availableTags, isLoading: tagsLoading } = useTags(showTagSelector);
  const deleteNodeMutation = useDeleteNode();

  // Initialize state from URL parameters
  useEffect(() => {
    const tagFromUrl = searchParams.get("tag");
    const tagsFromUrl = searchParams.get("tags");
    const searchFromUrl = searchParams.get("search");

    if (tagFromUrl) {
      setSelectedTag(decodeURIComponent(tagFromUrl));
    }

    if (tagsFromUrl) {
      const decodedTags = decodeURIComponent(tagsFromUrl)
        .split(",")
        .filter((t) => t.length > 0);
      setSelectedTags(decodedTags);
      // If tags are specified in URL, show the tag selector to reflect the selection
      if (decodedTags.length > 0) {
        setShowTagSelector(true);
      }
    }

    if (searchFromUrl) {
      const decodedSearch = decodeURIComponent(searchFromUrl);
      setSearchQuery(decodedSearch);
      setDebouncedQuery(decodedSearch);
    }
  }, [searchParams.get]); // Run only on mount

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when debounced query changes (but not on initial load)
  useEffect(() => {
    const isInitialLoad =
      searchParams.get("search") &&
      debouncedQuery === decodeURIComponent(searchParams.get("search")!);
    if (!isInitialLoad) {
      updateURLParams(undefined, debouncedQuery);
    }
  }, [debouncedQuery, searchParams.get, updateURLParams]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const tagFromUrl = searchParams.get("tag");
    const tagsFromUrl = searchParams.get("tags");
    const searchFromUrl = searchParams.get("search");

    // Update selectedTag if URL parameter changed
    if (tagFromUrl && tagFromUrl !== selectedTag) {
      setSelectedTag(decodeURIComponent(tagFromUrl));
    } else if (!tagFromUrl && selectedTag) {
      setSelectedTag(null);
    }

    // Update selectedTags if URL parameter changed
    if (tagsFromUrl) {
      const decodedTags = decodeURIComponent(tagsFromUrl)
        .split(",")
        .filter((t) => t.length > 0);
      const currentTagsStr = selectedTags.join(",");
      const urlTagsStr = decodedTags.join(",");

      if (urlTagsStr !== currentTagsStr) {
        setSelectedTags(decodedTags);
        // Show tag selector if tags are present
        if (decodedTags.length > 0 && !showTagSelector) {
          setShowTagSelector(true);
        }
      }
    } else if (!tagsFromUrl && selectedTags.length > 0) {
      setSelectedTags([]);
    }

    // Update searchQuery if URL parameter changed
    if (searchFromUrl) {
      const decodedSearch = decodeURIComponent(searchFromUrl);
      if (decodedSearch !== searchQuery) {
        setSearchQuery(decodedSearch);
      }
    } else if (!searchFromUrl && searchQuery) {
      setSearchQuery("");
    }
  }, [
    searchParams,
    searchQuery,
    selectedTag,
    selectedTags.join,
    selectedTags.length,
    showTagSelector,
  ]);

  // Filter nodes based on search query and selected tags
  const getFilteredNodes = (): Node[] => {
    let filteredNodes = debouncedQuery ? searchResults?.nodes || [] : nodes || [];

    // Apply single tag filter (legacy support)
    if (selectedTag) {
      filteredNodes = filteredNodes.filter((node) => node.tags?.includes(selectedTag));
    }

    // Apply multi-tag filter
    if (selectedTags.length > 0) {
      filteredNodes = filteredNodes.filter((node) =>
        selectedTags.every((tag) => node.tags?.includes(tag)),
      );
    }

    return filteredNodes;
  };

  const displayNodes = getFilteredNodes();

  const isLoading = nodesLoading || searchLoading;
  const error = nodesError;

  const handleDelete = (id: string) => {
    deleteNodeMutation.mutate(id);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by debounced effect
  };

  // Update URL parameters helper
  const updateURLParams = (newTag?: string | null, newSearch?: string, newTags?: string[]) => {
    const newParams = new URLSearchParams(searchParams);

    if (newTag !== undefined) {
      if (newTag === null) {
        newParams.delete("tag");
      } else {
        newParams.set("tag", encodeURIComponent(newTag));
      }
    }

    if (newTags !== undefined) {
      if (newTags.length === 0) {
        newParams.delete("tags");
      } else {
        newParams.set("tags", encodeURIComponent(newTags.join(",")));
      }
    }

    if (newSearch !== undefined) {
      if (newSearch === "") {
        newParams.delete("search");
      } else {
        newParams.set("search", encodeURIComponent(newSearch));
      }
    }

    setSearchParams(newParams, { replace: true });
  };

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      // If clicking the same tag, clear the filter
      setSelectedTag(null);
      updateURLParams(null);
    } else {
      // Set new tag filter
      setSelectedTag(tag);
      updateURLParams(tag);
    }
  };

  const clearFilters = () => {
    setSelectedTag(null);
    setSelectedTags([]);
    setSearchQuery("");
    setDebouncedQuery("");
    // Clear all URL parameters
    setSearchParams({}, { replace: true });
  };

  const handleTagToggle = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newSelectedTags);
    setSelectedTag(null); // Clear single tag when using multi-tag
    updateURLParams(null, undefined, newSelectedTags);
  };

  const renderNodes = () => {
    if (!displayNodes.length) return null;

    switch (viewMode) {
      case "grid":
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
                  if (window.confirm("Are you sure you want to delete this node?")) {
                    handleDelete(node.id);
                  }
                }}
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        );

      case "list":
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
                  if (window.confirm("Are you sure you want to delete this node?")) {
                    handleDelete(node.id);
                  }
                }}
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        );

      case "table":
        return (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayNodes.map((node) => (
                  <tr key={node.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
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
                              e.stopPropagation();
                              handleTagClick(tag);
                            }}
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-colors hover:bg-blue-200",
                              selectedTag === tag
                                ? "bg-blue-600 text-white"
                                : "bg-blue-100 text-blue-800",
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
                            if (window.confirm("Are you sure you want to delete this node?")) {
                              handleDelete(node.id);
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
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nodes</h1>
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
              className="px-3 py-2"
              title="Grid view"
            >
              <Icon icon="lucide:grid-3x3" width={16} height={16} />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
              className="px-3 py-2"
              title="List view"
            >
              <Icon icon="lucide:list" width={16} height={16} />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
              onClick={() => setViewMode("table")}
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

        {/* Tag Selector */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Filter by Tags:</span>
            <button
              onClick={() => setShowTagSelector(!showTagSelector)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Icon
                icon={showTagSelector ? "lucide:chevron-up" : "lucide:chevron-down"}
                width={16}
                height={16}
              />
              {showTagSelector ? "Hide" : "Show"} Tags
            </button>
          </div>

          {showTagSelector && (
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-gray-50 p-3">
              {tagsLoading ? (
                <div className="text-sm text-gray-500">Loading tags...</div>
              ) : availableTags && availableTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tagInfo) => (
                    <button
                      key={tagInfo.tag}
                      onClick={() => handleTagToggle(tagInfo.tag)}
                      className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors",
                        selectedTags.includes(tagInfo.tag)
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100",
                      )}
                    >
                      {tagInfo.tag}
                      <span className="ml-1.5 text-xs opacity-75">({tagInfo.count})</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No tags available</div>
              )}
            </div>
          )}
        </div>

        {/* Active Filters */}
        {(selectedTag || selectedTags.length > 0 || debouncedQuery) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              {selectedTag && (
                <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <span>Tag: {selectedTag}</span>
                  <button
                    onClick={() => {
                      setSelectedTag(null);
                      updateURLParams(null);
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <Icon icon="lucide:x" width={14} height={14} />
                  </button>
                </div>
              )}
              {selectedTags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>Tag: {tag}</span>
                  <button
                    onClick={() => handleTagToggle(tag)}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <Icon icon="lucide:x" width={14} height={14} />
                  </button>
                </div>
              ))}
              {debouncedQuery && (
                <div className="flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  <span>Search: "{debouncedQuery}"</span>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedQuery("");
                      updateURLParams(undefined, "");
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
            <small>Error details: {error instanceof Error ? error.message : "Unknown error"}</small>
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
            {selectedTags.length > 0 && (
              <p className="mt-2">No nodes found with tags: {selectedTags.join(", ")}</p>
            )}
            {(debouncedQuery || selectedTag || selectedTags.length > 0) && (
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
  );
}
