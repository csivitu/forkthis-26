import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Session } from "@/lib/api-types";

export function useSessionQuery() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => (await apiClient.get<Session | null>("/api/auth/get-session")).data,
    staleTime: 30_000,
    retry: false,
  });
}
