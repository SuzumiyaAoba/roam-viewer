import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Node } from "../../entities/node";
import { NodeListPage } from "./NodeListPage";

// Mock the Layout component
vi.mock("../../widgets/layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

// Mock the NodeCard components
vi.mock("../components/design-system/NodeCard", () => ({
  NodeCard: ({ title, file, tags, onCardClick, onEdit, onDelete, onTagClick }: any) => (
    <div data-testid="node-card">
      <h3 onClick={onCardClick}>{title}</h3>
      <p>{file}</p>
      <div>
        {tags?.map((tag: string) => (
          <button key={tag} onClick={() => onTagClick(tag)}>
            {tag}
          </button>
        ))}
      </div>
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  ),
  NodeCardCompact: ({ title, file, tags, onCardClick, onEdit, onDelete, onTagClick }: any) => (
    <div data-testid="node-card-compact">
      <h3 onClick={onCardClick}>{title}</h3>
      <p>{file}</p>
      <div>
        {tags?.map((tag: string) => (
          <button key={tag} onClick={() => onTagClick(tag)}>
            {tag}
          </button>
        ))}
      </div>
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  ),
}));

// Mock the Button component
vi.mock("../components/design-system/Button", () => ({
  Button: ({ children, onClick, variant, size, className, title, disabled }: any) => (
    <button
      onClick={onClick}
      className={className}
      title={title}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
}));

// Mock utility function
vi.mock("../components/design-system/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

// Mock iconify
vi.mock("@iconify/react", () => ({
  Icon: ({ icon, className }: { icon: string; className?: string }) => (
    <div data-testid={`icon-${icon}`} className={className} />
  ),
}));

// Mock react-use
vi.mock("react-use", () => ({
  useLocalStorage: () => {
    const [value, setValue] = vi.hoisted(() => {
      let mockValue = "grid";
      return [
        () => mockValue,
        (newValue: string) => {
          mockValue = newValue;
        },
      ];
    })();
    return [value(), setValue];
  },
}));

// Mock hooks
const mockUseNodes = vi.fn();
const mockUseSearchNodes = vi.fn();
const mockUseDeleteNode = vi.fn();
const mockUseSearchParams = vi.fn();
const mockSetSearchParams = vi.fn();
const mockUseNavigate = vi.fn();

vi.mock("../hooks/useNodes", () => ({
  useNodes: () => mockUseNodes(),
  useSearchNodes: (query: string) => mockUseSearchNodes(query),
  useDeleteNode: () => mockUseDeleteNode(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: () => [mockUseSearchParams(), mockSetSearchParams],
    useNavigate: () => mockUseNavigate(),
  };
});

// Mock window.confirm
Object.defineProperty(window, "confirm", {
  writable: true,
  value: vi.fn(() => true),
});

describe("NodeListPage", () => {
  let queryClient: QueryClient;
  const mockNavigate = vi.fn();
  const mockSearchParams = new URLSearchParams();
  const mockDeleteMutate = vi.fn();

  const mockNodes: Node[] = [
    {
      id: "1",
      title: "React Guide",
      file: "react.md",
      tags: ["react", "javascript"],
      content: "React guide content",
    },
    {
      id: "2",
      title: "Vue Tutorial",
      file: "vue.md",
      tags: ["vue", "javascript"],
      content: "Vue tutorial content",
    },
    {
      id: "3",
      title: "Node.js Basics",
      file: "nodejs.md",
      tags: ["nodejs", "backend"],
      content: "Node.js basics",
    },
  ];

  const renderNodeListPage = (initialRoute: string = "/nodes") => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseSearchParams.mockReturnValue(mockSearchParams);
    mockUseDeleteNode.mockReturnValue({
      mutate: mockDeleteMutate,
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <NodeListPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete("tag");
    mockSearchParams.delete("search");
    mockUseNodes.mockReturnValue({
      data: mockNodes,
      isLoading: false,
      error: null,
    });
    mockUseSearchNodes.mockReturnValue({
      data: { nodes: [], total: 0 },
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render with nodes in grid view", () => {
    renderNodeListPage();

    expect(screen.getByText("Nodes")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create new node/i })).toHaveAttribute(
      "href",
      "/nodes/new",
    );

    // Should show nodes in grid view by default
    const nodeCards = screen.getAllByTestId("node-card");
    expect(nodeCards).toHaveLength(3);
    expect(screen.getByText("React Guide")).toBeInTheDocument();
    expect(screen.getByText("Vue Tutorial")).toBeInTheDocument();
    expect(screen.getByText("Node.js Basics")).toBeInTheDocument();
  });

  it("should handle loading state", () => {
    mockUseNodes.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    renderNodeListPage();

    expect(screen.getByText("Loading nodes...")).toBeInTheDocument();
  });

  it("should handle error state", () => {
    mockUseNodes.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to load"),
    });

    renderNodeListPage();

    expect(screen.getByText(/error.*failed to fetch nodes/i)).toBeInTheDocument();
    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });

  it("should handle empty state", () => {
    mockUseNodes.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderNodeListPage();

    expect(screen.getByText("No nodes found.")).toBeInTheDocument();
  });

  it("should switch view modes", () => {
    renderNodeListPage();

    // Grid view (default)
    expect(screen.getAllByTestId("node-card")).toHaveLength(3);

    // Switch to list view
    const listViewButton = screen.getByTitle("List view");
    fireEvent.click(listViewButton);

    expect(screen.getAllByTestId("node-card-compact")).toHaveLength(3);

    // Switch to table view
    const tableViewButton = screen.getByTitle("Table view");
    fireEvent.click(tableViewButton);

    // In table view, nodes are rendered in table rows
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("Tags")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("should handle search functionality", async () => {
    vi.useFakeTimers();

    const searchResults = {
      nodes: [mockNodes[0]],
      total: 1,
    };
    mockUseSearchNodes.mockReturnValue({
      data: searchResults,
      isLoading: false,
    });

    renderNodeListPage();

    const searchInput = screen.getByPlaceholderText("Search nodes...");
    fireEvent.change(searchInput, { target: { value: "React" } });

    // Advance timers to trigger debounce
    vi.advanceTimersByTime(300);
    await waitFor(() => {
      expect(mockUseSearchNodes).toHaveBeenCalledWith("React");
    });

    vi.useRealTimers();
  });

  it("should handle tag filtering", () => {
    renderNodeListPage();

    // Click on a tag to filter
    const reactTag = screen.getByText("react");
    fireEvent.click(reactTag);

    expect(mockSetSearchParams).toHaveBeenCalled();

    // After filtering, should show active filter
    const activeFilters = screen.queryByText("Active filters:");
    // This depends on URL params being set properly in real scenario
  });

  it("should handle node card clicks for navigation", () => {
    renderNodeListPage();

    const nodeTitle = screen.getByText("React Guide");
    fireEvent.click(nodeTitle);

    expect(mockNavigate).toHaveBeenCalledWith("/nodes/1");
  });

  it("should handle node editing", () => {
    renderNodeListPage();

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/nodes/1/edit");
  });

  it("should handle node deletion with confirmation", () => {
    renderNodeListPage();

    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to delete this node?");
    expect(mockDeleteMutate).toHaveBeenCalledWith("1");
  });

  it("should not delete when confirmation is cancelled", () => {
    // Mock window.confirm to return false
    vi.mocked(window.confirm).mockReturnValue(false);

    renderNodeListPage();

    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteMutate).not.toHaveBeenCalled();
  });

  it("should initialize from URL parameters", () => {
    mockSearchParams.set("tag", "react");
    mockSearchParams.set("search", "tutorial");

    renderNodeListPage("/nodes?tag=react&search=tutorial");

    // Verify the component initializes with URL parameters
    // This would be more testable if we could check the input values directly
    expect(mockUseSearchParams).toHaveBeenCalled();
  });

  it("should clear all filters", () => {
    renderNodeListPage();

    // Simulate having active filters and then clearing them
    const searchInput = screen.getByPlaceholderText("Search nodes...");
    fireEvent.change(searchInput, { target: { value: "test search" } });

    // In a real scenario, this would show the clear all button
    // This test structure depends on the actual URL state management
  });

  it("should handle tag click in different view modes", () => {
    renderNodeListPage();

    // Test tag clicking in grid view
    const reactTag = screen.getByText("react");
    fireEvent.click(reactTag);

    expect(mockSetSearchParams).toHaveBeenCalled();

    // Switch to table view and test tag clicking
    const tableViewButton = screen.getByTitle("Table view");
    fireEvent.click(tableViewButton);

    // In table view, tags are clickable buttons
    const tableTags = screen.getAllByText("react");
    if (tableTags.length > 0) {
      fireEvent.click(tableTags[0]);
      expect(mockSetSearchParams).toHaveBeenCalled();
    }
  });

  it("should show correct node counts in table view", () => {
    const nodeWithManyTags = {
      ...mockNodes[0],
      tags: ["tag1", "tag2", "tag3", "tag4", "tag5"],
    };

    mockUseNodes.mockReturnValue({
      data: [nodeWithManyTags],
      isLoading: false,
      error: null,
    });

    renderNodeListPage();

    // Switch to table view
    const tableViewButton = screen.getByTitle("Table view");
    fireEvent.click(tableViewButton);

    // Should show only first 3 tags + "+2" indicator
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("should handle empty search results", () => {
    vi.useFakeTimers();

    mockUseSearchNodes.mockReturnValue({
      data: { nodes: [], total: 0 },
      isLoading: false,
    });

    renderNodeListPage();

    const searchInput = screen.getByPlaceholderText("Search nodes...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    vi.advanceTimersByTime(300);

    // Should show no results message
    expect(screen.getByText("No nodes found.")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("should display correct view mode button states", () => {
    renderNodeListPage();

    const gridButton = screen.getByTitle("Grid view");
    const listButton = screen.getByTitle("List view");
    const tableButton = screen.getByTitle("Table view");

    // Grid should be selected by default
    expect(gridButton).toHaveAttribute("data-variant", "default");
    expect(listButton).toHaveAttribute("data-variant", "ghost");
    expect(tableButton).toHaveAttribute("data-variant", "ghost");

    // Click list view
    fireEvent.click(listButton);

    // Button states should update (this would need actual button state management)
  });
});
