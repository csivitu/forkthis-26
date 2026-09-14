import { z } from "zod";
import { ApiError } from "../../utils/api-error";

interface GithubRepository {
  owner: string;
  name: string;
  githubRepoId: string;
}

const githubRepositoryResponseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  owner: z.object({ login: z.string().min(1) }),
});

export function parseGithubRepositoryUrl(repositoryUrl: string): {
  owner: string;
  name: string;
} {
  const url = new URL(repositoryUrl);
  const [owner, rawName] = url.pathname.split("/").filter(Boolean);
  if (!owner || !rawName)
    throw new ApiError(
      400,
      "INVALID_REPOSITORY_URL",
      `GitHub repository URL '${repositoryUrl}' is invalid`,
    );
  return { owner, name: rawName.replace(/\.git$/, "") };
}

export async function validateGithubRepository(
  repositoryUrl: string,
): Promise<GithubRepository> {
  const requested = parseGithubRepositoryUrl(repositoryUrl);
  let response: Response;
  try {
    response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(requested.owner)}/${encodeURIComponent(requested.name)}`,
      {
        headers: process.env.GITHUB_TOKEN
          ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : undefined,
      },
    );
  } catch (error) {
    throw new ApiError(
      502,
      "GITHUB_UNAVAILABLE",
      `GitHub validation failed for '${requested.owner}/${requested.name}': ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (!response.ok)
    throw new ApiError(
      response.status === 404 ? 422 : 502,
      "REPOSITORY_VALIDATION_FAILED",
      `GitHub could not validate '${requested.owner}/${requested.name}' (${response.status} ${response.statusText})`,
    );
  const parsed = githubRepositoryResponseSchema.safeParse(
    await response.json(),
  );
  if (!parsed.success)
    throw new ApiError(
      502,
      "INVALID_GITHUB_RESPONSE",
      `GitHub returned invalid repository data for '${requested.owner}/${requested.name}'`,
    );
  return {
    owner: parsed.data.owner.login,
    name: parsed.data.name,
    githubRepoId: String(parsed.data.id),
  };
}
