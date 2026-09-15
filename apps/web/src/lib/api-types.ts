export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: { page: number; limit: number };
}

export interface Session {
  user: {
    id: string;
    name: string | null;
    email: string;
    githubId: string | null;
    githubUsername: string | null;
    role: "student" | "admin";
  };
}

export interface Repository {
  id: string;
  owner: string;
  name: string;
  techStack: string | null;
  issueCount: number;
}

export interface Issue {
  id: string;
  githubIssueNumber: number;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  status: "open" | "solved" | "closed";
  points: number;
}

export interface PointsSummary {
  totalPoints: number;
  issuesSolved: number;
  maxPoints: number;
  totalIssues: number;
  transactions: {
    id: string;
    points: number;
    reason: "auto_merge" | "admin_manual";
    createdAt: string;
  }[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  githubUsername: string | null;
  avatarUrl: string | null;
  totalPoints: number;
}
