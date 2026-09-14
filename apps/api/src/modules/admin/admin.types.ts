import { z } from "zod";
import {
  adjustPointsSchema,
  createParticipantSchema,
  createRepositorySchema,
  issuesQuerySchema,
  membersQuerySchema,
  participantsQuerySchema,
  pullRequestsQuerySchema,
  syncLogsQuerySchema,
  transactionsQuerySchema,
  updateIssueSchema,
  updateRepositorySchema,
} from "@repo/admin-contracts";
import { uuidParamsSchema } from "../../utils/schema.util";

export const createRepoSchema = { body: createRepositorySchema };
export const updateRepoSchema = {
  params: uuidParamsSchema.params,
  body: updateRepositorySchema,
};
export const deleteRepoSchema = uuidParamsSchema;
export const listIssuesSchema = { query: issuesQuerySchema };
export const updateIssueRouteSchema = {
  params: uuidParamsSchema.params,
  body: updateIssueSchema,
};
export const awardPointsRouteSchema = { body: adjustPointsSchema };
export const listMembersSchema = { query: membersQuerySchema };
export const listPullRequestsSchema = { query: pullRequestsQuerySchema };
export const listSyncLogsSchema = { query: syncLogsQuerySchema };
export const listTransactionsSchema = { query: transactionsQuerySchema };
export const listParticipantsSchema = { query: participantsQuerySchema };
export const createParticipantRouteSchema = { body: createParticipantSchema };

export type IdParams = z.infer<typeof uuidParamsSchema.params>;
