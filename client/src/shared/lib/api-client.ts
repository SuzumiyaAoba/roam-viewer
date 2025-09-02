import type {
  BacklinkNode,
  CreateNodeRequest,
  Node,
  NodeDetail,
  SearchResult,
  UpdateNodeRequest,
} from "../types/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = "http://localhost:3001", timeout: number = 30000) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.timeout = timeout;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Use longer timeout for POST/PUT operations (updates can be slow with Japanese text)
    const requestTimeout =
      options.method === "POST" || options.method === "PUT" ? 90000 : this.timeout;

    // Log slow operations for debugging
    if (options.method === "POST" || options.method === "PUT") {
      console.log(
        `🕐 Starting ${options.method} request to: ${url} (timeout: ${requestTimeout}ms)`,
      );
    }

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const startTime = Date.now();
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Log completion time for slow operations
      if (options.method === "POST" || options.method === "PUT") {
        const duration = Date.now() - startTime;
        console.log(`✅ ${options.method} request completed: ${url} (${duration}ms)`);
      }

      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response,
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      } else {
        return (await response.text()) as unknown as T;
      }
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout errors specifically
      if (error instanceof Error && error.name === "AbortError") {
        console.warn(`Request timeout after ${requestTimeout}ms:`, url);
        throw new ApiError(`Request timeout after ${requestTimeout / 1000}s`, 408);
      }

      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // Node Operations
  async getNodes(): Promise<Node[]> {
    const result = await this.request<Node[] | { data: Node[] }>("/api/nodes");

    // Handle new API response format
    if (result && typeof result === "object" && "data" in result && Array.isArray(result.data)) {
      return result.data;
    } else if (Array.isArray(result)) {
      return result;
    }

    return [];
  }

  async getNode(id: string): Promise<NodeDetail> {
    return this.request<NodeDetail>(`/api/nodes/${encodeURIComponent(id)}`);
  }

  async createNode(nodeData: CreateNodeRequest): Promise<NodeDetail> {
    return this.request<NodeDetail>("/api/nodes", {
      method: "POST",
      body: JSON.stringify(nodeData),
    });
  }

  async updateNode(id: string, nodeData: UpdateNodeRequest): Promise<NodeDetail> {
    return this.request<NodeDetail>(`/api/nodes/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(nodeData),
    });
  }

  async deleteNode(id: string): Promise<void> {
    await this.request<void>(`/api/nodes/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }

  async deleteNodes(ids: string[]): Promise<void> {
    await this.request<void>("/api/nodes/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
  }

  // Search Operations
  async searchNodes(query: string): Promise<SearchResult> {
    const result = await this.request<
      { nodes: Node[]; count: number } | { nodes: Node[]; total: number }
    >(`/api/search/${encodeURIComponent(query)}`);

    // Handle new API response format
    if (result && result.nodes !== undefined) {
      return {
        nodes: Array.isArray(result.nodes) ? result.nodes : [],
        total: ("count" in result ? result.count : result.total) || 0,
      };
    } else if (result && Array.isArray(result)) {
      return {
        nodes: result,
        total: result.length,
      };
    }

    return { nodes: [], total: 0 };
  }

  // Tags
  async getTags(): Promise<{ tag: string; count: number }[]> {
    const result = await this.request<
      { tags: { tag: string; count: number }[] } | { tag: string; count: number }[]
    >("/api/tags");

    // Handle new API response format
    if (result && typeof result === "object" && "tags" in result && Array.isArray(result.tags)) {
      return result.tags.map((tagInfo: { tag: string; count: number }) => ({
        tag: tagInfo.tag,
        count: tagInfo.count,
      }));
    } else if (Array.isArray(result)) {
      return result;
    }

    return [];
  }

  async searchNodesByTag(tag: string): Promise<Node[]> {
    const result = await this.request<Node[] | { nodes: Node[] }>(
      `/api/search/tag/${encodeURIComponent(tag)}`,
    );

    // Handle new API response format
    if (result && typeof result === "object" && "nodes" in result && Array.isArray(result.nodes)) {
      return result.nodes;
    } else if (Array.isArray(result)) {
      return result;
    }

    return [];
  }

  // Relationships
  async getBacklinks(id: string): Promise<BacklinkNode[]> {
    return this.request<BacklinkNode[]>(`/api/nodes/${encodeURIComponent(id)}/backlinks`);
  }

  async getForwardLinks(id: string): Promise<BacklinkNode[]> {
    return this.request<BacklinkNode[]>(`/api/nodes/${encodeURIComponent(id)}/links`);
  }
}

// Default instance
export const apiClient = new ApiClient(import.meta.env.VITE_API_URL || "http://localhost:3001");
