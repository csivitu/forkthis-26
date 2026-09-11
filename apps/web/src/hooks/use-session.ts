import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export function useSessionQuery() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => (await authClient.getSession()).data,
  });
}