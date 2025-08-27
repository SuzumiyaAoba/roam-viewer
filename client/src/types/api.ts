export interface Node {
  id: string
  title: string
  file: string
  level?: number
  pos?: number
  todo?: string
  scheduled?: string
  deadline?: string
  tags?: string[]
  properties?: Record<string, any>
  olp?: string[]
}

export interface NodeDetail extends Node {
  content?: string
  aliases?: string[]
  refs?: string[]
}

export interface FileInfo {
  file: string
  title?: string
  hash?: string
  atime?: number
  mtime?: number
  ctime?: number
  size?: number
}

export interface SearchResult {
  nodes: Node[]
  total: number
}

export interface Tag {
  tag: string
  count: number
}

export interface BacklinkNode {
  id: string
  title: string
  file: string
  pos?: number
  properties?: Record<string, any>
  source?: string
  dest?: string
  type?: 'backlink' | 'forwardlink'
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface CreateNodeRequest {
  title: string
  content?: string
  tags?: string[]
  aliases?: string[]
  refs?: string[]
  file_type?: 'md' | 'org'
}

export interface UpdateNodeRequest {
  title?: string
  content?: string
  tags?: string[]
  aliases?: string[]
  refs?: string[]
}