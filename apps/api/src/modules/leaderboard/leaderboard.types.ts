export interface leaderboardQuery {
  limit?: string;
  page?: string;
}

export interface leaderboardEntry {
  rank: number;
  userId?: string;
  name: string | null;
  githubUsername: string | null;
  avatarUrl: string | null;
  totalPoints: number;
}
export type leaderboardResponse = leaderboardEntry[];
