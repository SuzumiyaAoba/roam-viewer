import { useLocalStorage } from "react-use";
import type { Node } from "../../entities/node";
import { useNodes, useSearchNodes } from "../../entities/node";
import {
  BulkOperationsBar,
  NodeGridView,
  NodeListView,
  NodeTableView,
  NodeListHeader,
  useNodeFiltering,
  useNodeSelection,
} from "../../features/node-management";
import { SearchPanel, useSearch } from "../../features/search";
import { TagSelector, useTagFiltering } from "../../features/tag-filtering";
import { Layout } from "../../widgets/layout";

type ViewMode = "grid" | "list" | "table";

/**
 * Refactored NodeListPage with high cohesion and loose coupling
 * - Separated concerns into feature-specific hooks and components
 * - Reduced from ~700 lines to <100 lines
 * - Clear separation of business logic and presentation
 */
export function NodeListPage() {
  // View mode state (only UI concern remaining in this component)
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>("node-list-view-mode", "grid");

  // Feature hooks - each manages its own domain
  const { searchQuery, debouncedQuery, updateSearchQuery } = useSearch();
  console.log("NodeListPage debouncedQuery:", debouncedQuery);
  const { selectedTag, selectedTags } = useTagFiltering();
  const { selectedNodes, toggleNodeSelection, clearSelection } = useNodeSelection();

  // Data fetching
  const { data: nodes, isLoading: nodesLoading, error: nodesError } = useNodes();
  const { data: searchResults, isLoading: searchLoading } = useSearchNodes(debouncedQuery);


  // Determine which nodes to use (search results or all nodes)
  const currentNodes: Node[] | undefined = debouncedQuery.trim() ? searchResults?.nodes : nodes;

  // Apply filtering logic
  const { filteredNodes, totalCount, filteredCount, hasActiveFilters } = useNodeFiltering(
    currentNodes,
    {
      searchQuery: debouncedQuery,
      selectedTag,
      selectedTags,
    },
  );

  // Loading and error states
  if (nodesLoading && !nodes) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading nodes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (nodesError) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20" role="img" aria-label="Error loading nodes icon">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load nodes</h3>
          <p className="text-gray-500">Please try refreshing the page.</p>
        </div>
      </Layout>
    );
  }

  const showCheckboxes = selectedNodes.size > 0 || filteredNodes.length > 1;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <NodeListHeader
          totalCount={totalCount}
          filteredCount={filteredCount}
          hasActiveFilters={hasActiveFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Search Panel */}
        <SearchPanel 
          searchQuery={searchQuery}
          onSearchChange={updateSearchQuery}
        />

        {/* Tag Selector */}
        <TagSelector />

        {/* Bulk Operations Bar */}
        <BulkOperationsBar selectedNodes={selectedNodes} onClearSelection={clearSelection} />

        {/* Loading State for Search */}
        {searchLoading && debouncedQuery.trim() && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Searching...</p>
          </div>
        )}

        {/* Node View - switches based on viewMode */}
        {viewMode === "grid" && (
          <NodeGridView
            nodes={filteredNodes}
            selectedNodes={selectedNodes}
            onToggleSelection={toggleNodeSelection}
            showCheckboxes={showCheckboxes}
          />
        )}
        {viewMode === "list" && (
          <NodeListView
            nodes={filteredNodes}
            selectedNodes={selectedNodes}
            onToggleSelection={toggleNodeSelection}
            showCheckboxes={showCheckboxes}
          />
        )}
        {viewMode === "table" && (
          <NodeTableView
            nodes={filteredNodes}
            selectedNodes={selectedNodes}
            onToggleSelection={toggleNodeSelection}
            showCheckboxes={showCheckboxes}
          />
        )}
      </div>
    </Layout>
  );
}
