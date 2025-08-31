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

  constructor(baseUrl: string = "http://localhost:3001") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

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
    const result = await this.request<Node[]>("/api/nodes");

    // Handle new API response format
    if (result && Array.isArray(result.data)) {
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

  // Search Operations
  async searchNodes(query: string): Promise<SearchResult> {
    const result = await this.request<
      { nodes: Node[]; count: number } | { nodes: Node[]; total: number }
    >(`/api/search/${encodeURIComponent(query)}`);

    // Handle new API response format
    if (result && result.nodes !== undefined) {
      return {
        nodes: Array.isArray(result.nodes) ? result.nodes : [],
        total: result.count || 0,
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
    if (result && Array.isArray(result.tags)) {
      return result.tags.map((tagInfo) => ({
        tag: tagInfo.tag,
        count: tagInfo.count,
      }));
    } else if (Array.isArray(result)) {
      return result;
    }

    return [];
  }

  async searchNodesByTag(tag: string): Promise<Node[]> {
    const result = await this.request<Node[]>(`/api/search/tag/${encodeURIComponent(tag)}`);

    // Handle new API response format
    if (result && Array.isArray(result.nodes)) {
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
