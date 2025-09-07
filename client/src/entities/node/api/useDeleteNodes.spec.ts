import { describe, expect, test } from "vitest";

// Unit tests for bulk delete functionality (logic only, no React components)
describe("Bulk delete logic", () => {
  test("should handle empty node IDs array", () => {
    const nodeIds: string[] = [];
    const result = filterValidNodeIds(nodeIds);
    expect(result).toEqual([]);
  });

  test("should filter out invalid node IDs", () => {
    const nodeIds = ["valid-id", "", "another-valid-id", null as unknown, undefined as unknown] as (string | null | undefined)[];
    const result = filterValidNodeIds(nodeIds);
    expect(result).toEqual(["valid-id", "another-valid-id"]);
  });

  test("should handle confirmation dialog logic", () => {
    const selectedCount = 5;
    const message = generateBulkDeleteMessage(selectedCount);
    expect(message).toBe("Are you sure you want to delete 5 nodes? This action cannot be undone.");
  });

  test("should generate correct delete message for single node", () => {
    const selectedCount = 1;
    const message = generateBulkDeleteMessage(selectedCount);
    expect(message).toBe("Are you sure you want to delete 1 node? This action cannot be undone.");
  });

  test("should handle selection state management", () => {
    const initialSelection = new Set<string>();
    const nodeId = "test-node-1";

    // Test adding to selection
    const afterAdd = toggleSelection(initialSelection, nodeId);
    expect(afterAdd.has(nodeId)).toBe(true);

    // Test removing from selection
    const afterRemove = toggleSelection(afterAdd, nodeId);
    expect(afterRemove.has(nodeId)).toBe(false);
  });

  test("should validate node ID format", () => {
    expect(isValidNodeId("valid-node-id")).toBe(true);
    expect(isValidNodeId("node_123")).toBe(true);
    expect(isValidNodeId("")).toBe(false);
    expect(isValidNodeId(" ")).toBe(false);
    expect(isValidNodeId(null as unknown)).toBe(false);
    expect(isValidNodeId(undefined as unknown)).toBe(false);
  });

  test("should count selected nodes correctly", () => {
    const selectedNodes = new Set(["node1", "node2", "node3"]);
    const totalNodes = 10;

    const result = getSelectionSummary(selectedNodes, totalNodes);
    expect(result).toEqual({
      selectedCount: 3,
      totalCount: 10,
      hasSelection: true,
      allSelected: false,
    });
  });

  test("should detect when all nodes are selected", () => {
    const selectedNodes = new Set(["node1", "node2"]);
    const totalNodes = 2;

    const result = getSelectionSummary(selectedNodes, totalNodes);
    expect(result.allSelected).toBe(true);
  });
});

// Helper functions that would be used in the component
function filterValidNodeIds(nodeIds: (string | null | undefined)[]): string[] {
  return nodeIds.filter((id): id is string => isValidNodeId(id));
}

function generateBulkDeleteMessage(count: number): string {
  const nodeText = count === 1 ? "node" : "nodes";
  return `Are you sure you want to delete ${count} ${nodeText}? This action cannot be undone.`;
}

function toggleSelection(currentSelection: Set<string>, nodeId: string): Set<string> {
  const newSelection = new Set(currentSelection);
  if (newSelection.has(nodeId)) {
    newSelection.delete(nodeId);
  } else {
    newSelection.add(nodeId);
  }
  return newSelection;
}

function isValidNodeId(id: unknown): id is string {
  return typeof id === "string" && id.trim().length > 0;
}

function getSelectionSummary(selectedNodes: Set<string>, totalNodes: number) {
  const selectedCount = selectedNodes.size;
  return {
    selectedCount,
    totalCount: totalNodes,
    hasSelection: selectedCount > 0,
    allSelected: selectedCount === totalNodes && totalNodes > 0,
  };
}
