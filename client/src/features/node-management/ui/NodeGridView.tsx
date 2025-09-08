import { useNavigate } from "react-router-dom";
import type { Node } from "../../../entities/node";
import { useDeleteNode } from "../../../entities/node";
import { NodeCard } from "../../../shared/ui";

interface NodeGridViewProps {
  nodes: Node[];
  selectedNodes?: Set<string>;
  onToggleSelection?: (nodeId: string) => void;
  showCheckboxes?: boolean;
  className?: string;
}

/**
 * Grid view for displaying nodes as cards
 */
export function NodeGridView({
  nodes,
  selectedNodes = new Set(),
  onToggleSelection,
  showCheckboxes = false,
  className,
}: NodeGridViewProps) {
  const navigate = useNavigate();
  const deleteNodeMutation = useDeleteNode();

  const handleNodeClick = (nodeId: string) => {
    navigate(`/nodes/${encodeURIComponent(nodeId)}`);
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (
      window.confirm("Are you sure you want to delete this node? This action cannot be undone.")
    ) {
      try {
        await deleteNodeMutation.mutateAsync(nodeId);
      } catch (error) {
        console.error("Failed to delete node:", error);
      }
    }
  };

  const handleEditNode = (nodeId: string) => {
    navigate(`/nodes/${encodeURIComponent(nodeId)}/edit`);
  };

  if (nodes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="No nodes found icon">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No nodes found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {nodes.map((node) => (
          <NodeCard
            key={node.id}
            title={node.title}
            content={node.content}
            file={node.file}
            tags={node.tags}
            todo={node.todo}
            onCardClick={() => handleNodeClick(node.id)}
            onDelete={() => handleDeleteNode(node.id)}
            onEdit={() => handleEditNode(node.id)}
            showCheckbox={showCheckboxes}
            isSelected={selectedNodes.has(node.id)}
            onSelectionChange={onToggleSelection ? () => onToggleSelection(node.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
