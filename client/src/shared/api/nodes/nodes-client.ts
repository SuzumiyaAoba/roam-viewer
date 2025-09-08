import type { CreateNodeRequest, Node, NodeDetail, UpdateNodeRequest } from "../../types/api";
import { BaseApiClient } from "../base-client";

/**
 * API client for node-related operations
 * High cohesion: All node operations in one place
 * Loose coupling: Extends base client for common functionality
 */
export class NodesApiClient extends BaseApiClient {
  protected basePath = "/api/nodes";

  /**
   * Get all nodes
   */
  async getNodes(): Promise<Node[]> {
    return this.get<Node[]>("");
  }

  /**
   * Get a specific node by ID
   */
  async getNode(id: string): Promise<NodeDetail> {
    return this.get<NodeDetail>(`/${encodeURIComponent(id)}`);
  }

  /**
   * Create a new node
   */
  async createNode(node: CreateNodeRequest): Promise<NodeDetail> {
    return this.post<NodeDetail>("", node);
  }

  /**
   * Update an existing node
   */
  async updateNode(id: string, node: UpdateNodeRequest): Promise<NodeDetail> {
    return this.put<NodeDetail>(`/${encodeURIComponent(id)}`, node);
  }

  /**
   * Delete a node
   */
  async deleteNode(id: string): Promise<void> {
    return this.delete<void>(`/${encodeURIComponent(id)}`);
  }

  /**
   * Delete multiple nodes
   */
  async deleteNodes(ids: string[]): Promise<void> {
    return this.post<void>("/bulk-delete", { ids });
  }

  /**
   * Get backlinks for a node
   */
  async getBacklinks(id: string): Promise<Node[]> {
    return this.get<Node[]>(`/${encodeURIComponent(id)}/backlinks`);
  }

  /**
   * Get forward links for a node
   */
  async getForwardLinks(id: string): Promise<Node[]> {
    return this.get<Node[]>(`/${encodeURIComponent(id)}/forward-links`);
  }
}
