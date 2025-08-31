import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../shared/lib/api-client'

export function useTags(enabled: boolean = true) {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => apiClient.getTags(),
    enabled,
  })
}