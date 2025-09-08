import { useNavigate } from "react-router-dom";
import type { Node } from "../../../entities/node";
import { useDeleteNode } from "../../../entities/node";

interface NodeTableViewProps {
  nodes: Node[];
  selectedNodes?: Set<string>;
  onToggleSelection?: (nodeId: string) => void;
  showCheckboxes?: boolean;
  className?: string;
}

/**
 * Table view for displaying nodes in a structured table format
 */
export function NodeTableView({
  nodes,
  selectedNodes = new Set(),
  onToggleSelection,
  showCheckboxes = false,
  className,
}: NodeTableViewProps) {
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
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {showCheckboxes && (
                  <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 sm:left-6"
                      checked={nodes.length > 0 && nodes.every(node => selectedNodes.has(node.id))}
                      onChange={() => {
                        const allSelected = nodes.every(node => selectedNodes.has(node.id));
                        nodes.forEach(node => {
                          if (allSelected && selectedNodes.has(node.id)) {
                            onToggleSelection?.(node.id);
                          } else if (!allSelected && !selectedNodes.has(node.id)) {
                            onToggleSelection?.(node.id);
                          }
                        });
                      }}
                    />
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {nodes.map((node) => (
                <tr
                  key={node.id}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedNodes.has(node.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNodeClick(node.id)}
                >
                  {showCheckboxes && (
                    <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 sm:left-6"
                        checked={selectedNodes.has(node.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          onToggleSelection?.(node.id);
                        }}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {node.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-md">
                      <div className="line-clamp-2">
                        {node.content 
                          ? (node.content.length > 100 
                              ? `${node.content.substring(0, 100)}...` 
                              : node.content)
                          : <span className="italic text-gray-400">No content</span>
                        }
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 max-w-xs truncate" title={node.file}>
                      {node.file}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {node.todo ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        node.todo === 'TODO' ? 'bg-red-100 text-red-800' :
                        node.todo === 'DONE' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {node.todo}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {node.tags && node.tags.length > 0 ? (
                        <>
                          {node.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {node.tags.length > 2 && (
                            <span className="text-gray-400 text-xs">
                              +{node.tags.length - 2}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}