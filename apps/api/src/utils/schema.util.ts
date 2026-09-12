import { z } from "zod";

/** Postgres uuid primary/foreign keys, used across every module. */
export const uuidField = (label: string) => z.string().uuid(`${label} must be a valid UUID`);


export const nullableTextField = z
  .string()
  .trim()
  .nullish()
  .transform((value) => (value ? value : null));

export const paginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  page: z.coerce.number().int().min(1).default(1),
});

/** A route whose only input is a `:id` path param that must be a UUID. */
export const uuidParamsSchema = {
  params: z.object({ id: uuidField("id") }),
};
