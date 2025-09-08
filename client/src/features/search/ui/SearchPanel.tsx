import { SearchForm } from "../../../shared/ui";
import { useSearch } from "../lib/useSearch";

interface SearchPanelProps {
  className?: string;
}

/**
 * Search panel component that manages search functionality
 */
export function SearchPanel({ className }: SearchPanelProps) {
  const { searchQuery, updateSearchQuery } = useSearch();

  return (
    <div className={className}>
      <SearchForm
        value={searchQuery}
        onChange={updateSearchQuery}
        placeholder="Search nodes by title, content, or tags..."
      />
    </div>
  );
}
