import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useRepositories() {
  return useQuery({
    queryKey: ["dashboard", "repositories"],
    queryFn: async () => (await apiClient.get("/api/dashboard/repositories")).data,
  });
}

export function useRepositoryIssues(repoId: string) {
  return useQuery({
    queryKey: ["dashboard", "issues", repoId],
    queryFn: async () => (await apiClient.get(`/api/dashboard/issues/${repoId}`)).data,
    enabled: !!repoId,
  });
}

export function usePointTransactions() {
  return useQuery({
    queryKey: ["dashboard", "point-transactions"],
    queryFn: async () => (await apiClient.get("/api/dashboard/point-transactions")).data,
  });
}