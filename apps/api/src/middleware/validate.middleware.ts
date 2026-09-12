import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";
import { ZodType, type z } from "zod";
import { ApiError } from "../utils/api-error";

export interface ValidationSchemas<
  TBody extends ZodType | undefined = undefined,
  TQuery extends ZodType | undefined = undefined,
  TParams extends ZodType | undefined = undefined,
> {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
}

function formatZodError(error: z.ZodError, section?: "body" | "query" | "params") {
  return error.issues.map((issue) => ({
    path: [section, ...issue.path].filter(Boolean).join("."),
    message: issue.message,
  }));
}


function assignQuery(req: Request, value: unknown) {
  Object.defineProperty(req, "query", {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
}

export function validate<
  TBody extends ZodType | undefined = undefined,
  TQuery extends ZodType | undefined = undefined,
  TParams extends ZodType | undefined = undefined,
>(
  schemas: ValidationSchemas<TBody, TQuery, TParams>,
): RequestHandler<
  TParams extends ZodType ? z.infer<TParams> : ParamsDictionary,
  any,
  TBody extends ZodType ? z.infer<TBody> : unknown,
  TQuery extends ZodType ? z.infer<TQuery> : ParsedQs
> {
  return (async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.params) {
        const result = await schemas.params.safeParseAsync(req.params);
        if (!result.success) {
          throw new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
            errors: formatZodError(result.error, "params"),
          });
        }
        req.params = result.data as typeof req.params;
      }

      if (schemas.query) {
        const result = await schemas.query.safeParseAsync(req.query);
        if (!result.success) {
          throw new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
            errors: formatZodError(result.error, "query"),
          });
        }
        assignQuery(req, result.data);
      }

      if (schemas.body) {
        const result = await schemas.body.safeParseAsync(req.body);
        if (!result.success) {
          throw new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
            errors: formatZodError(result.error, "body"),
          });
        }
        req.body = result.data;
      }

      next();
    } catch (error) {
      next(error);
    }
  }) as unknown as RequestHandler<
    TParams extends ZodType ? z.infer<TParams> : ParamsDictionary,
    any,
    TBody extends ZodType ? z.infer<TBody> : unknown,
    TQuery extends ZodType ? z.infer<TQuery> : ParsedQs
  >;
}