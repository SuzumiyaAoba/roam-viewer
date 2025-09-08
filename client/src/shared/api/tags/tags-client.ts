import type { Tag } from "../../../entities/tag/model/types";
import { BaseApiClient } from "../base-client";

/**
 * API client for tag-related operations
 */
export class TagsApiClient extends BaseApiClient {
  protected basePath = "/api/tags";

  /**
   * Get all available tags
   */
  async getTags(): Promise<Tag[]> {
    return this.get<Tag[]>("/");
  }

  /**
   * Get nodes by tag
   */
  async getNodesByTag(tag: string): Promise<string[]> {
    return this.get<string[]>(`/${encodeURIComponent(tag)}/nodes`);
  }

  /**
   * Get tag statistics
   */
  async getTagStats(): Promise<Array<Tag & { usage_trend?: number[] }>> {
    return this.get<Array<Tag & { usage_trend?: number[] }>>("/stats");
  }
}
