import type { z } from "zod";
import { paginationQuery } from "../../utils/schema.util";

export const leaderboardQuerySchema = {
  query: paginationQuery,
};
export type leaderboardQuery = z.infer<typeof leaderboardQuerySchema.query>;

export interface leaderboardEntry {
  rank: number;
  userId?: string;
  name: string | null;
  githubUsername: string | null;
  avatarUrl: string | null;
  totalPoints: number;
}
export type leaderboardResponse = leaderboardEntry[];
