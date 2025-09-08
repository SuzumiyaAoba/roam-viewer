import { useNavigate } from "react-router-dom";
import type { Node } from "../../../entities/node";
import { useDeleteNode } from "../../../entities/node";

interface NodeListViewProps {
  nodes: Node[];
  selectedNodes?: Set<string>;
  onToggleSelection?: (nodeId: string) => void;
  showCheckboxes?: boolean;
  className?: string;
}

/**
 * List view for displaying nodes in a vertical list format
 */
export function NodeListView({
  nodes,
  selectedNodes = new Set(),
  onToggleSelection,
  showCheckboxes = false,
  className,
}: NodeListViewProps) {
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
      <div className="space-y-4">
        {nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer text-left"
            onClick={() => handleNodeClick(node.id)}
          >
            <div className="flex items-start justify-between">
              {/* Left side: Checkbox + Content */}
              <div className="flex items-start space-x-3 flex-1">
                {showCheckboxes && (
                  <input
                    type="checkbox"
                    checked={selectedNodes.has(node.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleSelection?.(node.id);
                    }}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  {/* Title and TODO status */}
                  <div className="flex items-center space-x-2 mb-1">
                    {node.todo && (
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        node.todo === 'TODO' ? 'bg-red-100 text-red-800' :
                        node.todo === 'DONE' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {node.todo}
                      </span>
                    )}
                    <h3 className="text-lg font-medium text-gray-900 truncate">{node.title}</h3>
                  </div>

                  {/* Content preview */}
                  {node.content && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                      {node.content.length > 150 
                        ? `${node.content.substring(0, 150)}...` 
                        : node.content
                      }
                    </p>
                  )}

                  {/* File and Tags */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="truncate">{node.file}</span>
                    {node.tags && node.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 ml-4">
                        {node.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {node.tags.length > 3 && (
                          <span className="text-gray-400 text-xs">
                            +{node.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side: Action buttons */}
              <div className="flex space-x-2 ml-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditNode(node.id);
                  }}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit node"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Edit">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNode(node.id);
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete node"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Delete">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}