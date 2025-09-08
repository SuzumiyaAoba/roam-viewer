import { useCallback, useState } from "react";

/**
 * Hook for managing node selection state
 */
export function useNodeSelection() {
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());

  const toggleNodeSelection = useCallback((nodeId: string) => {
    setSelectedNodes((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(nodeId)) {
        newSelection.delete(nodeId);
      } else {
        newSelection.add(nodeId);
      }
      return newSelection;
    });
  }, []);

  const selectAllNodes = useCallback((nodeIds: string[]) => {
    setSelectedNodes(new Set(nodeIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodes(new Set());
  }, []);

  const isNodeSelected = useCallback(
    (nodeId: string) => {
      return selectedNodes.has(nodeId);
    },
    [selectedNodes],
  );

  const isAllSelected = useCallback(
    (nodeIds: string[]) => {
      return nodeIds.length > 0 && nodeIds.every((id) => selectedNodes.has(id));
    },
    [selectedNodes],
  );

  const getSelectedCount = useCallback(() => {
    return selectedNodes.size;
  }, [selectedNodes]);

  return {
    selectedNodes,
    toggleNodeSelection,
    selectAllNodes,
    clearSelection,
    isNodeSelected,
    isAllSelected,
    getSelectedCount,
  };
}
