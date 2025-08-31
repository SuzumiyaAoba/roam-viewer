import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as apiModule from "../../../shared/lib/api-client";
import { useNodesByTag, useTags } from "../../tag/api/useTag";
import {
  useBacklinks,
  useCreateNode,
  useDeleteNode,
  useForwardLinks,
  useNode,
  useNodes,
  useSearchNodes,
  useUpdateNode,
} from "./useNode";

// Mock the API client
vi.mock("../../../shared/lib/api-client");
const mockApiClient = apiModule.apiClient as any;

describe("useNodes hooks", () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    vi.clearAllMocks();
  });

  describe("useNodes", () => {
    it("should fetch nodes successfully", async () => {
      const mockNodes = [
        { id: "1", title: "Node 1", file: "node1.md" },
        { id: "2", title: "Node 2", file: "node2.md" },
      ];
      mockApiClient.getNodes.mockResolvedValue(mockNodes);

      const { result } = renderHook(() => useNodes(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.getNodes).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockNodes);
    });

    it("should handle error when fetching nodes", async () => {
      mockApiClient.getNodes.mockRejectedValue(new Error("Failed to fetch"));

      const { result } = renderHook(() => useNodes(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe("useNode", () => {
    it("should fetch single node successfully", async () => {
      const mockNode = {
        id: "1",
        title: "Test Node",
        file: "test.md",
        content: "Test content",
      };
      mockApiClient.getNode.mockResolvedValue(mockNode);

      const { result } = renderHook(() => useNode("1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.getNode).toHaveBeenCalledWith("1");
      expect(result.current.data).toEqual(mockNode);
    });

    it("should not fetch when id is empty", () => {
      const { result } = renderHook(() => useNode(""), { wrapper });

      expect(result.current.isIdle).toBe(true);
      expect(mockApiClient.getNode).not.toHaveBeenCalled();
    });
  });

  describe("useSearchNodes", () => {
    it("should search nodes successfully", async () => {
      const mockSearchResult = {
        nodes: [{ id: "1", title: "Found Node", file: "found.md" }],
        total: 1,
      };
      mockApiClient.searchNodes.mockResolvedValue(mockSearchResult);

      const { result } = renderHook(() => useSearchNodes("test query"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.searchNodes).toHaveBeenCalledWith("test query");
      expect(result.current.data).toEqual(mockSearchResult);
    });

    it("should not search when query is empty", () => {
      const { result } = renderHook(() => useSearchNodes(""), { wrapper });

      expect(result.current.isIdle).toBe(true);
      expect(mockApiClient.searchNodes).not.toHaveBeenCalled();
    });
  });

  describe("useBacklinks", () => {
    it("should fetch backlinks successfully", async () => {
      const mockBacklinks = [
        { id: "2", title: "Linking Node", file: "linking.md", type: "backlink" as const },
      ];
      mockApiClient.getBacklinks.mockResolvedValue(mockBacklinks);

      const { result } = renderHook(() => useBacklinks("1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.getBacklinks).toHaveBeenCalledWith("1");
      expect(result.current.data).toEqual(mockBacklinks);
    });

    it("should not fetch when id is empty", () => {
      const { result } = renderHook(() => useBacklinks(""), { wrapper });

      expect(result.current.isIdle).toBe(true);
      expect(mockApiClient.getBacklinks).not.toHaveBeenCalled();
    });
  });

  describe("useForwardLinks", () => {
    it("should fetch forward links successfully", async () => {
      const mockLinks = [
        { id: "3", title: "Linked Node", file: "linked.md", type: "forwardlink" as const },
      ];
      mockApiClient.getForwardLinks.mockResolvedValue(mockLinks);

      const { result } = renderHook(() => useForwardLinks("1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.getForwardLinks).toHaveBeenCalledWith("1");
      expect(result.current.data).toEqual(mockLinks);
    });
  });

  describe("useCreateNode", () => {
    it("should create node successfully", async () => {
      const mockNewNode = {
        id: "new-id",
        title: "New Node",
        file: "new.md",
        content: "New content",
      };
      mockApiClient.createNode.mockResolvedValue(mockNewNode);

      const { result } = renderHook(() => useCreateNode(), { wrapper });

      const createData = {
        title: "New Node",
        content: "New content",
        file_type: "md" as const,
      };

      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.createNode).toHaveBeenCalledWith(createData);
      expect(result.current.data).toEqual(mockNewNode);
    });

    it("should invalidate queries on success", async () => {
      const mockNewNode = { id: "new-id", title: "New Node", file: "new.md" };
      mockApiClient.createNode.mockResolvedValue(mockNewNode);

      const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreateNode(), { wrapper });

      result.current.mutate({
        title: "New Node",
        file_type: "md",
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["nodes"] });
    });
  });

  describe("useUpdateNode", () => {
    it("should update node successfully", async () => {
      const mockUpdatedNode = {
        id: "1",
        title: "Updated Node",
        file: "updated.md",
        content: "Updated content",
      };
      mockApiClient.updateNode.mockResolvedValue(mockUpdatedNode);

      const { result } = renderHook(() => useUpdateNode(), { wrapper });

      const updateData = {
        title: "Updated Node",
        content: "Updated content",
      };

      result.current.mutate({ id: "1", data: updateData });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.updateNode).toHaveBeenCalledWith("1", updateData);
      expect(result.current.data).toEqual(mockUpdatedNode);
    });

    it("should invalidate queries on success", async () => {
      const mockUpdatedNode = { id: "1", title: "Updated Node", file: "updated.md" };
      mockApiClient.updateNode.mockResolvedValue(mockUpdatedNode);

      const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateNode(), { wrapper });

      result.current.mutate({ id: "1", data: { title: "Updated Node" } });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["nodes"] });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["nodes", "1"] });
    });
  });

  describe("useDeleteNode", () => {
    it("should delete node successfully", async () => {
      mockApiClient.deleteNode.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteNode(), { wrapper });

      result.current.mutate("1");

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.deleteNode).toHaveBeenCalledWith("1");
    });

    it("should invalidate queries on success", async () => {
      mockApiClient.deleteNode.mockResolvedValue(undefined);

      const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useDeleteNode(), { wrapper });

      result.current.mutate("1");

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["nodes"] });
    });
  });

  describe("useTags", () => {
    it("should fetch tags successfully", async () => {
      const mockTags = [
        { tag: "tag1", count: 5 },
        { tag: "tag2", count: 3 },
      ];
      mockApiClient.getTags.mockResolvedValue(mockTags);

      const { result } = renderHook(() => useTags(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.getTags).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockTags);
    });
  });

  describe("useNodesByTag", () => {
    it("should fetch nodes by tag successfully", async () => {
      const mockNodes = [{ id: "1", title: "Tagged Node", file: "tagged.md", tags: ["test-tag"] }];
      mockApiClient.searchNodesByTag.mockResolvedValue(mockNodes);

      const { result } = renderHook(() => useNodesByTag("test-tag"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.searchNodesByTag).toHaveBeenCalledWith("test-tag");
      expect(result.current.data).toEqual(mockNodes);
    });

    it("should not fetch when tag is empty", () => {
      const { result } = renderHook(() => useNodesByTag(""), { wrapper });

      expect(result.current.isIdle).toBe(true);
      expect(mockApiClient.searchNodesByTag).not.toHaveBeenCalled();
    });
  });
});
