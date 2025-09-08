import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { Button, cn } from "../../../shared/ui";

type ViewMode = "grid" | "list" | "table";

interface NodeListHeaderProps {
  totalCount?: number;
  filteredCount?: number;
  hasActiveFilters?: boolean;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  className?: string;
}

/**
 * Header component for the node list page
 */
export function NodeListHeader({
  totalCount = 0,
  filteredCount = 0,
  hasActiveFilters = false,
  viewMode = "grid",
  onViewModeChange,
  className,
}: NodeListHeaderProps) {
  const viewModeButtons: Array<{
    mode: ViewMode;
    icon: string;
    label: string;
  }> = [
    { mode: "grid", icon: "heroicons:squares-2x2", label: "Grid" },
    { mode: "list", icon: "heroicons:bars-3", label: "List" },
    { mode: "table", icon: "heroicons:table-cells", label: "Table" },
  ];

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        className,
      )}
    >
      {/* Title and Stats */}
      <div className="flex items-baseline space-x-4">
        <h1 className="text-3xl font-bold text-gray-900">Nodes</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>
            {hasActiveFilters ? (
              <>
                <span className="font-medium text-blue-600">{filteredCount}</span>
                <span className="text-gray-400"> of </span>
                <span>{totalCount}</span>
              </>
            ) : (
              <span>{totalCount}</span>
            )}{" "}
            {totalCount === 1 ? "node" : "nodes"}
          </span>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              <Icon icon="heroicons:funnel" className="w-3 h-3 mr-1" />
              Filtered
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* View Mode Selector */}
        {onViewModeChange && (
          <div className="flex items-center border rounded-lg p-1 bg-gray-50">
            {viewModeButtons.map(({ mode, icon, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewModeChange(mode)}
                className={cn(
                  "flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  viewMode === mode
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                )}
                title={`${label} view`}
              >
                <Icon icon={icon} className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Create Node Button */}
        <Button asChild>
          <Link to="/nodes/new">
            <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
            Create Node
          </Link>
        </Button>
      </div>
    </div>
  );
}
