import { useMemo } from "react";
import type { Node } from "../../../entities/node";

interface FilterOptions {
  searchQuery?: string;
  selectedTag?: string | null;
  selectedTags?: string[];
}

/**
 * Hook for filtering nodes based on search and tag criteria
 */
export function useNodeFiltering(nodes: Node[] | undefined, options: FilterOptions) {
  const { searchQuery, selectedTag, selectedTags = [] } = options;

  const filteredNodes = useMemo(() => {
    if (!nodes) return [];

    let filtered = [...nodes];

    // Apply search filter
    if (searchQuery?.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (node) =>
          node.title.toLowerCase().includes(query) ||
          node.content?.toLowerCase().includes(query) ||
          node.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Apply single tag filter
    if (selectedTag) {
      filtered = filtered.filter((node) => node.tags?.includes(selectedTag));
    }

    // Apply multiple tags filter (AND logic)
    if (selectedTags.length > 0) {
      filtered = filtered.filter((node) => selectedTags.every((tag) => node.tags?.includes(tag)));
    }

    return filtered;
  }, [nodes, searchQuery, selectedTag, selectedTags]);

  const totalCount = nodes?.length || 0;
  const filteredCount = filteredNodes.length;
  const hasActiveFilters = Boolean(searchQuery?.trim() || selectedTag || selectedTags.length > 0);

  return {
    filteredNodes,
    totalCount,
    filteredCount,
    hasActiveFilters,
  };
}
