import { useCallback, useEffect, useState } from "react";

/**
 * Hook for managing search state with debouncing
 */
export function useSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    console.log("🔍 useSearch: searchQuery changed to:", searchQuery);
    const timer = setTimeout(() => {
      console.log("🔍 useSearch: setting debouncedQuery to:", searchQuery);
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const updateSearchQuery = useCallback((query: string) => {
    console.log("🔍 useSearch.updateSearchQuery called with:", query);
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