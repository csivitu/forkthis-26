import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, LeaderboardEntry } from "@/lib/api-types";

export function useLeaderboard(page: number) {
  return useQuery({
    queryKey: ["leaderboard", page],
    queryFn: async () => (await apiClient.get<ApiResponse<LeaderboardEntry[]>>("/api/leaderboard", { params: { page, limit: 25 } })).data.data,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
