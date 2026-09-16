import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Issue, PointsSummary, Repository } from "@/lib/api-types";

export function useRepositories(enabled: boolean, userId: string | undefined) {
  return useQuery({
    queryKey: ["dashboard", userId, "repositories"],
    queryFn: async () => (await apiClient.get<ApiResponse<Repository[]>>("/api/dashboard/repositories")).data.data,
    enabled,
  });
}

export function useRepositoryIssues(repoId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ["dashboard", userId, "issues", repoId],
    queryFn: async () => (await apiClient.get<ApiResponse<{ issues: Issue[]; issuesSolved: number }>>(`/api/dashboard/repositories/${repoId}/issues`)).data.data,
    enabled: !!repoId,
  });
}

export function usePointTransactions(enabled: boolean, userId: string | undefined) {
  return useQuery({
    queryKey: ["dashboard", userId, "point-transactions"],
    queryFn: async () => (await apiClient.get<ApiResponse<PointsSummary>>("/api/dashboard/point-transactions")).data.data,
    enabled,
  });
}
