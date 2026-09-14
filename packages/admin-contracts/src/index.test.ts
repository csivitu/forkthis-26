import { describe, expect, test } from "bun:test";
import {
  adjustPointsSchema,
  createRepositorySchema,
  participantsQuerySchema,
  updateIssueSchema,
} from "./index.js";

const adjustment = {
  userId: "85dfe730-5301-48d7-a1a3-6ddbc80ed550",
  issueId: "8ddc1dc1-8041-43cb-9c39-7743c39e405a",
  note: "Correction after review",
};

describe("admin contracts", () => {
  test("accepts signed non-zero adjustments with a note", () => {
    expect(
      adjustPointsSchema.safeParse({ ...adjustment, points: 10 }).success,
    ).toBe(true);
    expect(
      adjustPointsSchema.safeParse({ ...adjustment, points: -10 }).success,
    ).toBe(true);
  });
  test("rejects zero adjustments and missing notes", () => {
    expect(
      adjustPointsSchema.safeParse({ ...adjustment, points: 0 }).success,
    ).toBe(false);
    expect(
      adjustPointsSchema.safeParse({
        userId: adjustment.userId,
        issueId: adjustment.issueId,
        points: 10,
      }).success,
    ).toBe(false);
  });
  test("limits issue edits to non-negative integer points", () => {
    expect(updateIssueSchema.safeParse({ points: 25 }).success).toBe(true);
    expect(updateIssueSchema.safeParse({ points: -1 }).success).toBe(false);
  });
  test("accepts only GitHub repository URLs", () => {
    expect(
      createRepositorySchema.safeParse({
        repositoryUrl: "https://github.com/csivitu/forkthis-26",
        techStack: "TypeScript",
      }).success,
    ).toBe(true);
    expect(
      createRepositorySchema.safeParse({
        repositoryUrl: "https://example.com/csivitu/forkthis-26",
        techStack: null,
      }).success,
    ).toBe(false);
  });
  test("coerces and bounds pagination", () => {
    expect(
      participantsQuerySchema.parse({ page: "2", limit: "25" }),
    ).toMatchObject({ page: 2, limit: 25 });
    expect(
      participantsQuerySchema.safeParse({ page: "0", limit: "101" }).success,
    ).toBe(false);
  });
});
