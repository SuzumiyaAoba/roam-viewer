// Node Entity Types

export interface Node {
  id: string;
  title: string;
  file: string;
  level?: number;
  pos?: number;
  todo?: string;
  scheduled?: string;
  deadline?: string;
  tags?: string[];
  properties?: Record<string, any>;
  olp?: string[];
  content?: string; // Add content for test compatibility
  aliases?: string[]; // Add aliases for test compatibility
  refs?: string[]; // Add refs for test compatibility
}

export interface NodeDetail extends Node {
  content?: string;
  aliases?: string[];
  refs?: string[];
  file_type?: "md" | "org";
}

export interface BacklinkNode {
  id: string;
  title: string;
  file: string;
  pos?: number;
  properties?: Record<string, any>;
  source?: string;
  dest?: string;
  type?: "backlink" | "forwardlink";
}

export interface CreateNodeRequest {
  title: string;
  content?: string;
  tags?: string[];
  aliases?: string[];
  refs?: string[];
  file_type?: "md" | "org";
}

export interface UpdateNodeRequest {
  title?: string;
  content?: string;
  tags?: string[];
  aliases?: string[];
  refs?: string[];
}

export interface SearchResult {
  nodes: Node[];
  total: number;
}
