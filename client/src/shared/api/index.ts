// Export base client and error class
export { ApiError, BaseApiClient } from "./base-client";

// Export domain-specific clients
export { NodesApiClient } from "./nodes/nodes-client";
export { SearchApiClient } from "./search/search-client";
export { TagsApiClient } from "./tags/tags-client";

// Import for internal use
import { NodesApiClient } from "./nodes/nodes-client";
import { SearchApiClient } from "./search/search-client";
import { TagsApiClient } from "./tags/tags-client";

// Create singleton instances for convenience
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const nodesApi = new NodesApiClient(baseUrl);
export const searchApi = new SearchApiClient(baseUrl);
export const tagsApi = new TagsApiClient(baseUrl);

/**
 * Unified API client that provides access to all domain clients
 * Maintains backward compatibility while providing better organization
 */
export class ApiClient {
  public readonly nodes: NodesApiClient;
  public readonly search: SearchApiClient;
  public readonly tags: TagsApiClient;

  constructor(baseUrl?: string, timeout?: number) {
    this.nodes = new NodesApiClient(baseUrl, timeout);
    this.search = new SearchApiClient(baseUrl, timeout);
    this.tags = new TagsApiClient(baseUrl, timeout);
  }

  // Backward compatibility methods - delegate to domain clients
  async getNodes() {
    return this.nodes.getNodes();
  }

  async getNode(id: string) {
    return this.nodes.getNode(id);
  }

  async createNode(node: Parameters<NodesApiClient["createNode"]>[0]) {
    return this.nodes.createNode(node);
  }

  async updateNode(id: string, node: Parameters<NodesApiClient["updateNode"]>[1]) {
    return this.nodes.updateNode(id, node);
  }

  async deleteNode(id: string) {
    return this.nodes.deleteNode(id);
  }

  async deleteNodes(ids: string[]) {
    return this.nodes.deleteNodes(ids);
  }

  async searchNodes(query: string) {
    return this.search.searchNodes(query);
  }

  async getTags() {
    return this.tags.getTags();
  }

  async getBacklinks(id: string) {
    return this.nodes.getBacklinks(id);
  }

  async getForwardLinks(id: string) {
    return this.nodes.getForwardLinks(id);
  }

  async searchNodesByTag(tag: string) {
    return this.search.searchNodesByTag(tag);
  }
}

// Default instance for backward compatibility
export const apiClient = new ApiClient(baseUrl);
