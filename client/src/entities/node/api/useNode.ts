import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../shared/lib/api-client";
import type { CreateNodeRequest, UpdateNodeRequest } from "../model/types";

export const useNodes = () => {
  return useQuery({
    queryKey: ["nodes"],
    queryFn: () => apiClient.getNodes(),
  });
};

export const useNode = (id: string) => {
  return useQuery({
    queryKey: ["nodes", id],
    queryFn: () => apiClient.getNode(id),
    enabled: !!id,
  });
};

export const useSearchNodes = (query: string) => {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => apiClient.searchNodes(query),
    enabled: !!query,
  });
};

export const useBacklinks = (id: string) => {
  return useQuery({
    queryKey: ["backlinks", id],
    queryFn: () => apiClient.getBacklinks(id),
    enabled: !!id,
  });
};

export const useForwardLinks = (id: string) => {
  return useQuery({
    queryKey: ["forwardLinks", id],
    queryFn: () => apiClient.getForwardLinks(id),
    enabled: !!id,
  });
};

export const useCreateNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNodeRequest) => apiClient.createNode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
    },
  });
};

export const useUpdateNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNodeRequest }) =>
      apiClient.updateNode(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
      queryClient.invalidateQueries({ queryKey: ["nodes", id] });
    },
  });
};

export const useDeleteNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteNode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
    },
  });
};

export const useNodesByTag = (tag: string) => {
  return useQuery({
    queryKey: ["nodes", "tag", tag],
    queryFn: () => apiClient.searchNodesByTag(tag),
    enabled: !!tag,
  });
};
