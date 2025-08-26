import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'
import type { CreateNodeRequest, UpdateNodeRequest } from '../types/api'

export function useNodes() {
  return useQuery({
    queryKey: ['nodes'],
    queryFn: () => apiClient.getNodes(),
  })
}

export function useNode(id: string) {
  return useQuery({
    queryKey: ['nodes', id],
    queryFn: () => apiClient.getNode(id),
    enabled: !!id,
  })
}

export function useSearchNodes(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => apiClient.searchNodes(query),
    enabled: !!query,
  })
}

export function useBacklinks(id: string) {
  return useQuery({
    queryKey: ['backlinks', id],
    queryFn: () => apiClient.getBacklinks(id),
    enabled: !!id,
  })
}

export function useForwardLinks(id: string) {
  return useQuery({
    queryKey: ['forwardLinks', id],
    queryFn: () => apiClient.getForwardLinks(id),
    enabled: !!id,
  })
}

export function useCreateNode() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateNodeRequest) => apiClient.createNode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useUpdateNode() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNodeRequest }) =>
      apiClient.updateNode(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
      queryClient.invalidateQueries({ queryKey: ['nodes', id] })
    },
  })
}

export function useDeleteNode() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteNode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => apiClient.getTags(),
  })
}

export function useNodesByTag(tag: string) {
  return useQuery({
    queryKey: ['nodes', 'tag', tag],
    queryFn: () => apiClient.searchNodesByTag(tag),
    enabled: !!tag,
  })
}