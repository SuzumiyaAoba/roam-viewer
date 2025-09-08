import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Hook for managing search state with URL synchronization and debouncing
 */
export function useSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() =>
    decodeURIComponent(searchParams.get("search") || ""),
  );
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when debounced query changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (debouncedQuery.trim()) {
      newParams.set("search", encodeURIComponent(debouncedQuery));
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams, { replace: true });
  }, [debouncedQuery, searchParams, setSearchParams]);

  // Initialize from URL on mount
  useEffect(() => {
    const urlQuery = decodeURIComponent(searchParams.get("search") || "");
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams, searchQuery]);

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return {
    searchQuery,
    debouncedQuery,
    updateSearchQuery,
    clearSearch,
  };
}
