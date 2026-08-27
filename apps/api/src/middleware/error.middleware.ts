import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details,
    });
  }

  const message = err instanceof Error ? err.message : "Internal server error";

  return res.status(500).json({
    success: false,
    error: message,
  });
};