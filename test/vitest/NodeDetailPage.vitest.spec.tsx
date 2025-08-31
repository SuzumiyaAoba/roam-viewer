import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as useNodesModule from "../../entities/node/api/useNode";
import { NodeDetailPage } from "./NodeDetailPage";

// Mock the hooks
vi.mock("../../entities/node/api/useNode");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "test-node-id" }),
    useNavigate: () => vi.fn(),
  };
});

// Mock ReactMarkdown to avoid complex rendering issues in tests
vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => (
    <div data-testid="markdown-content">{children}</div>
  ),
}));

// Mock window.confirm
Object.defineProperty(window, "confirm", {
  writable: true,
  value: vi.fn(),
});

const mockUseNode = useNodesModule.useNode as any;
const mockUseBacklinks = useNodesModule.useBacklinks as any;
const mockUseForwardLinks = useNodesModule.useForwardLinks as any;
const mockUseDeleteNode = useNodesModule.useDeleteNode as any;

describe("NodeDetailPage", () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  const mockNode = {
    id: "test-node-id",
    title: "Test Node Title",
    file: "test-node.md",
    content: "# Test Node\n\nThis is test content with **bold** text.",
    tags: ["tag1", "tag2", "programming"],
    aliases: ["Test Alias", "Alternative Name"],
    refs: ["https://example.com", "internal-ref"],
    level: 2,
    todo: "TODO",
  };

  const mockBacklinks = [
    {
      id: "backlink-1",
      title: "Backlink Node 1",
      file: "backlink1.md",
      source: "test-node-id",
      dest: "backlink-1",
      type: "backlink" as const,
    },
    {
      id: "backlink-2",
      title: "Backlink Node 2",
      file: "backlink2.md",
      type: "backlink" as const,
    },
  ];

  const mockForwardLinks = [
    {
      id: "forward-1",
      title: "Forward Link 1",
      file: "forward1.md",
      source: "test-node-id",
      dest: "forward-1",
      type: "forwardlink" as const,
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );

    // Default mock implementations
    mockUseNode.mockReturnValue({
      data: mockNode,
      isLoading: false,
      error: null,
    });
    mockUseBacklinks.mockReturnValue({ data: mockBacklinks });
    mockUseForwardLinks.mockReturnValue({ data: mockForwardLinks });
    mockUseDeleteNode.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    vi.clearAllMocks();
  });

  describe("Loading and Error States", () => {
    it("should show loading state", () => {
      mockUseNode.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<NodeDetailPage />, { wrapper });

      expect(screen.getByText("Loading node...")).toBeInTheDocument();
    });

    it("should show error state when node not found", () => {
      mockUseNode.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error("Not found"),
      });

      render(<NodeDetailPage />, { wrapper });

      expect(screen.getByText(/error:/i)).toBeInTheDocument();
      expect(screen.getByText(/node not found/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /back to nodes/i })).toBeInTheDocument();
    });

    it("should show error state when node is null", () => {
      mockUseNode.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      render(<NodeDetailPage />, { wrapper });

      expect(screen.getByText(/node not found/i)).toBeInTheDocument();
    });
  });

  describe("Node Content Display", () => {
    it("should render node title and basic information", () => {
      render(<NodeDetailPage />, { wrapper });

      expect(screen.getByText("Test Node Title")).toBeInTheDocument();
      expect(screen.getByText("test-node.md")).toBeInTheDocument();
      expect(screen.getByText("test-node-id")).toBeInTheDocument();
    });

    it("should render node content in markdown format by default", () => {
      render(<NodeDetailPage />, { wrapper });

      expect(screen.getByTestId("markdown-content")).toBeInTheDocument();
      // Should not show the raw content initially
      expect(screen.queryByText("# Test Node")).not.toBeInTheDocument();
    });

    it("should toggle between raw and rendered content", () => {
      render(<NodeDetailPage />, { wrapper });

      const toggleButton = screen.getByRole("button", { name: /raw/i });
      fireEvent.click(toggleButton);

      // Should now show raw content
      expect(screen.getByText("# Test Node")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /rendered/i })).toBeInTheDocument();

      // Toggle back
      fireEvent.click(screen.getByRole("button", { name: /rendered/i }));
      expect(screen.getByTestId("markdown-content")).toBeInTheDocument();
    });

    it("should handle node with no content", () => {
      const nodeWithoutContent = { ...mockNode, content: null };
      mockUseNode.mockReturnValue({
        data: nodeWithoutContent,
        isLoading: false,
        error: null,
      });

      render(<NodeDetailPage />, { wrapper });

      expect(screen.getByText("No content available.")).toBeInTheDocument();
    });
  });

  describe("Navigation and Actions", () => {
    it("should render navigation links", () => {
      render(<NodeDetailPage />, { wrapper });

      expect(screen.getByRole("link", { name: /back to nodes/i })).toHaveAttribute(
        "href",
        "/nodes",
      );
      expect(screen.getByRole("link", { name: /edit node/i })).toHaveAttribute(
        "href",
        "/nodes/test-node-id/edit",
      );
    });

    it("should render edit and delete buttons", () => {
      render(<NodeDetailPage />, { wrapper });

      expect(screen.getByRole("link", { name: /edit node/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /delete node/i })).toBeInTheDocument();
    });

    it("should handle delete action with confirmation", () => {
      const mockNavigate = vi.fn();
      const mockMutate = vi.fn();

      vi.mocked(window.confirm).mockReturnValue(true);
      mockUseDeleteNode.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      // Mock useNavigate
      vi.doMock("react-router-dom", async () => {
        const actual = await vi.importActual("react-router-dom");
        return {
          ...actual,
          useParams: () => ({ id: "test-node-id" }),
          useNavigate: () => mockNavigate,
        };
      });

      render(<NodeDetailPage />, { wrapper });

      const deleteButton = screen.getByRole("button", { name: /delete node/i });
      fireEvent.click(deleteButton);

      expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to delete this node?");
      expect(mockMutate).toHaveBeenCalledWith("test-node-id", expect.any(Object));
    });

    it("should cancel delete when user cancels confirmation", () => {
      const mockMutate = vi.fn();
      vi.mocked(window.confirm).mockReturnValue(false);

      mockUseDeleteNode.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      render(<NodeDetailPage />, { wrapper });

      const deleteButton = screen.getByRole("button", { name: /delete node/i });
      fireEvent.click(deleteButton);

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should show loading state for delete button when pending", () => {
      mockUseDeleteNode.mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
      });

      render(<NodeDetailPage />, { wrapper });

      const deleteButton = screen.getByRole("button", { name: /deleting.../i });
      expect(deleteButton).toBeDisabled();
    });
  });

  describe("Node Information Display", () => {
    it("should display node metadata", () => {
      render(<NodeDetailPage />, { wrapper });

      expect(screen.getByText("Node Info")).toBeInTheDocument();
      expect(screen.getByText("ID")).toBeInTheDocument();
      expect(screen.getByText("File")).toBeInTheDocument();
      expect(screen.getByText("Level")).toBeInTheDocument();
      expect(screen.getByText("TODO")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument(); // level value
    });

    it("should display tags when available", () => {
      render(<NodeDetailPage />, { wrapper });

      expect(screen.getByText("Tags")).toBeInTheDocument();
      expect(screen.getByText("tag1")).toBeInTheDocument();
      expect(screen.getByText("tag2")).toBeInTheDocument();
      expect(screen.getByText("programming")).toBeInTheDocument();
    });

    it("should hide tags section when no tags", () => {
      const nodeWithoutTags = { ...mockNode, tags: [] };
      mockUseNode.mockReturnValue({
        data: nodeWithoutTags,
        isLoading: false,
        error: null,
      });

      render(<NodeDetailPage />, { wrapper });

      expect(screen.queryByText("Tags")).not.toBeInTheDocument();
    });

    it("should display aliases when available", () => {
      render(<NodeDetailPage />, { wrapper });

      expect(screen.getByText("Aliases")).toBeInTheDocument();
      expect(screen.getByText("Test Alias")).toBeInTheDocument();
      expect(screen.getByText("Alternative Name")).toBeInTheDocument();
    });

    it("should display references with proper linking", () => {
      render(<NodeDetailPage />, { wrapper });

      expect(screen.getByText("References (2)")).toBeInTheDocument();

      const externalLink = screen.getByRole("link", { name: "https://example.com" });
      expect(externalLink).toHaveAttribute("href", "https://example.com");
      expect(externalLink).toHaveAttribute("target", "_blank");
      expect(externalLink).toHaveAttribute("rel", "noopener noreferrer");

      expect(screen.getByText("internal-ref")).toBeInTheDocument();
    });
  });

  describe("Backlinks and Forward Links", () => {
    it("should display backlinks when available", () => {
      render(<NodeDetailPage />, { wrapper });

      expect(screen.getByText("Backlinks (2)")).toBeInTheDocument();
      expect(screen.getByText("Backlink Node 1")).toBeInTheDocument();
      expect(screen.getByText("Backlink Node 2")).toBeInTheDocument();
    });

    it("should display forward links when available", () => {
      render(<NodeDetailPage />, { wrapper });

      expect(screen.getByText("Forward Links (1)")).toBeInTheDocument();
      expect(screen.getByText("Forward Link 1")).toBeInTheDocument();
    });

    it("should hide backlinks section when no backlinks", () => {
      mockUseBacklinks.mockReturnValue({ data: [] });

      render(<NodeDetailPage />, { wrapper });

      expect(screen.queryByText(/backlinks/i)).not.toBeInTheDocument();
    });

    it("should hide forward links section when no forward links", () => {
      mockUseForwardLinks.mockReturnValue({ data: [] });

      render(<NodeDetailPage />, { wrapper });

      expect(screen.queryByText(/forward links/i)).not.toBeInTheDocument();
    });

    it("should render backlink cards with source/dest information", () => {
      render(<NodeDetailPage />, { wrapper });

      expect(screen.getByText("Source:")).toBeInTheDocument();
      expect(screen.getByText("Dest:")).toBeInTheDocument();
      expect(screen.getByText("test-node-id")).toBeInTheDocument();
      expect(screen.getByText("backlink-1")).toBeInTheDocument();
    });
  });

  describe("Frontmatter Handling", () => {
    it("should remove frontmatter from content", () => {
      const contentWithFrontmatter = `---
title: Test
tags: [test]
---
# Actual Content

This is the real content.`;

      const nodeWithFrontmatter = {
        ...mockNode,
        content: contentWithFrontmatter,
      };

      mockUseNode.mockReturnValue({
        data: nodeWithFrontmatter,
        isLoading: false,
        error: null,
      });

      render(<NodeDetailPage />, { wrapper });

      // Toggle to raw view to check frontmatter removal
      const toggleButton = screen.getByRole("button", { name: /raw/i });
      fireEvent.click(toggleButton);

      // Should show the original content with frontmatter in raw view
      expect(screen.getByText(/title: Test/)).toBeInTheDocument();

      // Toggle back to rendered view - frontmatter should be removed
      fireEvent.click(screen.getByRole("button", { name: /rendered/i }));
      const markdownContent = screen.getByTestId("markdown-content");
      expect(markdownContent.textContent).not.toContain("title: Test");
      expect(markdownContent.textContent).toContain("# Actual Content");
    });
  });

  describe("Responsive Layout", () => {
    it("should render grid layout for main content and sidebar", () => {
      const { container } = render(<NodeDetailPage />, { wrapper });

      const gridContainer = container.querySelector(".grid");
      expect(gridContainer).toHaveClass("grid-cols-1", "lg:grid-cols-3");
    });
  });

  describe("Accessibility", () => {
    it("should have proper button labels and titles", () => {
      render(<NodeDetailPage />, { wrapper });

      expect(screen.getByRole("button", { name: /raw/i })).toBeInTheDocument();
      expect(screen.getByTitle("Edit node")).toBeInTheDocument();
      expect(screen.getByTitle("Delete node")).toBeInTheDocument();
    });

    it("should have proper heading hierarchy", () => {
      render(<NodeDetailPage />, { wrapper });

      // Should have h1 for main title (from Layout)
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Test Node Title");

      // Should have h2 for sections
      expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(6); // Node Info, Tags, Aliases, References, Backlinks, Forward Links
    });
  });
});
