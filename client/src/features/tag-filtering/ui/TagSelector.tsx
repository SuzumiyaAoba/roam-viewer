import { Icon } from "@iconify/react";
import type React from "react";
import { useState } from "react";
import { useTags } from "../../../entities/tag";
import { Badge, Button, cn } from "../../../shared/ui";
import { useTagFiltering } from "../lib/useTagFiltering";

interface TagSelectorProps {
  className?: string;
}

/**
 * Tag selector component for filtering nodes by tags
 */
export function TagSelector({ className }: TagSelectorProps) {
  const [showTagSelector, setShowTagSelector] = useState(false);
  const {
    selectedTag,
    selectedTags,
    selectTag,
    clearTag,
    toggleTagInSelection,
    clearTagSelection,
  } = useTagFiltering();
  const { data: availableTags, isLoading: tagsLoading } = useTags(showTagSelector);

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      clearTag();
    } else {
      selectTag(tag);
    }
  };

  const handleMultiTagToggle = (tag: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTagInSelection(tag);
  };

  const hasActiveFilters = Boolean(selectedTag || selectedTags.length > 0);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Tag Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon icon="heroicons:tag" className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by tags</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              {selectedTag ? "1 tag" : `${selectedTags.length} tags`}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearTag();
                clearTagSelection();
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear filters
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTagSelector(!showTagSelector)}
            className="text-xs"
          >
            <Icon icon="heroicons:adjustments-horizontal" className="w-4 h-4 mr-1" />
            {showTagSelector ? "Hide" : "Show"} tags
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedTag && (
            <Badge
              variant="default"
              className="cursor-pointer hover:bg-blue-600"
              onClick={() => clearTag()}
            >
              {selectedTag}
              <Icon icon="heroicons:x-mark" className="w-3 h-3 ml-1" />
            </Badge>
          )}
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-gray-300"
              onClick={() => toggleTagInSelection(tag)}
            >
              {tag}
              <Icon icon="heroicons:x-mark" className="w-3 h-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}

      {/* Tag Selector Grid */}
      {showTagSelector && (
        <div className="border rounded-lg p-4 bg-gray-50">
          {tagsLoading ? (
            <div className="text-center py-4">
              <Icon
                icon="heroicons:arrow-path"
                className="w-5 h-5 animate-spin mx-auto text-gray-400"
              />
              <p className="text-sm text-gray-500 mt-2">Loading tags...</p>
            </div>
          ) : availableTags && availableTags.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {availableTags.map((tag) => (
                <div key={tag.tag} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleTagClick(tag.tag)}
                    className={cn(
                      "flex-1 px-3 py-2 text-sm rounded-md border transition-colors text-left",
                      selectedTag === tag.tag
                        ? "bg-blue-100 border-blue-300 text-blue-800"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    <span className="truncate">{tag.tag}</span>
                    <span className="text-xs text-gray-500 ml-1">({tag.count})</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleMultiTagToggle(tag.tag, e)}
                    className={cn(
                      "ml-1 w-6 h-6 rounded border transition-colors flex items-center justify-center",
                      selectedTags.includes(tag.tag)
                        ? "bg-green-100 border-green-300 text-green-700"
                        : "border-gray-300 text-gray-400 hover:border-gray-400",
                    )}
                    title="Add to multi-tag filter"
                  >
                    <Icon icon="heroicons:plus" className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No tags available</p>
          )}
        </div>
      )}
    </div>
  );
}
