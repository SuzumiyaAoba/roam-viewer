import { SearchForm } from "../../../shared/ui";

interface SearchPanelProps {
  className?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

/**
 * Search panel component that manages search functionality
 */
export function SearchPanel({ className, searchQuery = "", onSearchChange }: SearchPanelProps) {
  return (
    <div className={className}>
      <SearchForm
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search nodes by title, content, or tags..."
      />
    </div>
  );
}
