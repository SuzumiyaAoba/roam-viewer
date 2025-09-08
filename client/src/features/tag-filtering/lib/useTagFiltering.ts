import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Hook for managing tag filtering state with URL synchronization
 */
export function useTagFiltering() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Initialize from URL on mount
  useEffect(() => {
    const urlTag = searchParams.get("tag");
    const urlTags = searchParams.get("tags");

    if (urlTag) {
      setSelectedTag(decodeURIComponent(urlTag));
    }

    if (urlTags) {
      setSelectedTags(decodeURIComponent(urlTags).split(","));
    }
  }, [searchParams]);

  const updateURLParams = useCallback(
    (newTag?: string | null, newTags?: string[]) => {
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

      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const selectTag = useCallback(
    (tag: string) => {
      setSelectedTag(tag);
      updateURLParams(tag, undefined);
    },
    [updateURLParams],
  );

  const clearTag = useCallback(() => {
    setSelectedTag(null);
    updateURLParams(null, undefined);
  }, [updateURLParams]);

  const toggleTagInSelection = useCallback(
    (tag: string) => {
      const newTags = selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag];

      setSelectedTags(newTags);
      updateURLParams(undefined, newTags);
    },
    [selectedTags, updateURLParams],
  );

  const clearTagSelection = useCallback(() => {
    setSelectedTags([]);
    updateURLParams(undefined, []);
  }, [updateURLParams]);

  return {
    selectedTag,
    selectedTags,
    selectTag,
    clearTag,
    toggleTagInSelection,
    clearTagSelection,
  };
}
