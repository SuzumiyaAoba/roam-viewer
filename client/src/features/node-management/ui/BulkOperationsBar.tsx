import { Icon } from "@iconify/react";
import { useDeleteNodes } from "../../../entities/node";
import { Button, cn } from "../../../shared/ui";

interface BulkOperationsBarProps {
  selectedNodes: Set<string>;
  onClearSelection: () => void;
  className?: string;
}

/**
 * Bulk operations bar for managing multiple selected nodes
 */
export function BulkOperationsBar({
  selectedNodes,
  onClearSelection,
  className,
}: BulkOperationsBarProps) {
  const deleteNodesMutation = useDeleteNodes();
  const selectedCount = selectedNodes.size;

  const handleBulkDelete = async () => {
    if (selectedCount === 0) return;

    const confirmation =
      selectedCount === 1
        ? "Are you sure you want to delete this node? This action cannot be undone."
        : `Are you sure you want to delete ${selectedCount} nodes? This action cannot be undone.`;

    if (window.confirm(confirmation)) {
      try {
        await deleteNodesMutation.mutateAsync(Array.from(selectedNodes));
        onClearSelection();
      } catch (error) {
        console.error("Failed to delete nodes:", error);
        // Error handling is managed by the mutation's onError callback
      }
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "sticky top-0 z-10 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4",
        "flex items-center justify-between",
        className,
      )}
    >
      {/* Selection Info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Icon icon="heroicons:check-circle" className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} {selectedCount === 1 ? "node" : "nodes"} selected
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
        >
          Clear selection
        </Button>
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center space-x-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleBulkDelete}
          disabled={deleteNodesMutation.isPending}
          className="min-w-[120px]"
        >
          {deleteNodesMutation.isPending ? (
            <>
              <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Icon icon="heroicons:trash" className="w-4 h-4 mr-2" />
              Delete {selectedCount === 1 ? "Node" : "Nodes"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
