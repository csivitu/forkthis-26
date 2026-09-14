import { describe, expect, test } from "bun:test";
import { parseGithubRepositoryUrl } from "./github-repository";

describe("parseGithubRepositoryUrl", () => {
  test("extracts owner and repository from a GitHub URL", () => {
    expect(
      parseGithubRepositoryUrl("https://github.com/csivitu/forkthis-26.git"),
    ).toEqual({ owner: "csivitu", name: "forkthis-26" });
  });
});
