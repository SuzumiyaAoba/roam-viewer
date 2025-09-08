import type { SearchResult } from "../../types/api";
import { BaseApiClient } from "../base-client";

/**
 * API client for search-related operations
 */
export class SearchApiClient extends BaseApiClient {
  protected basePath = "/api/search";

  /**
   * Search nodes by query
   */
  async searchNodes(query: string): Promise<SearchResult> {
    if (!query.trim()) {
      return { nodes: [], total: 0 };
    }

    return this.get<SearchResult>(`/nodes?q=${encodeURIComponent(query)}`);
  }

  /**
   * Search nodes with advanced filters
   */
  async searchNodesAdvanced(params: {
    query?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<SearchResult> {
    const searchParams = new URLSearchParams();

    if (params.query?.trim()) {
      searchParams.set("q", params.query);
    }

    if (params.tags && params.tags.length > 0) {
      searchParams.set("tags", params.tags.join(","));
    }

    if (params.limit) {
      searchParams.set("limit", params.limit.toString());
    }

    if (params.offset) {
      searchParams.set("offset", params.offset.toString());
    }

    return this.get<SearchResult>(`/nodes?${searchParams.toString()}`);
  }

  /**
   * Search nodes by tag
   */
  async searchNodesByTag(tag: string): Promise<SearchResult> {
    if (!tag.trim()) {
      return { nodes: [], total: 0 };
    }

    return this.searchNodesAdvanced({ tags: [tag] });
  }
}
