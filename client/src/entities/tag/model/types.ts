// Tag Entity Types

export interface Tag {
  tag: string
  count: number
}

export interface TagWithNodes {
  tag: string
  count: number
  node_ids: string[]
}