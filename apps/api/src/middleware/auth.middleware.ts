import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.config";
import {userRole} from "@repo/db"

export interface AuthRequest<
  P = unknown,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown

> extends Request<P, ResBody,ReqBody,ReqQuery> {
  user?: NonNullable<Awaited<ReturnType<typeof
    auth.api.getSession>>>["user"];
}

export const requireSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const session = await auth.api.getSession({
    headers:
      fromNodeHeaders(req.headers)
  });

  if (!session) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHENTICATED", message: "A valid session is required" },
    });
  }
  req.user = session.user;
  next();
};

export const requireGithubLinked = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.githubId) {
    return res.status(403).json({
      success: false,
      error: { code: "GITHUB_LINK_REQUIRED", message: "A linked GitHub account is required" },
    });
  }
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== userRole.Admin) {
    return res.status(403).json({
      success: false,
      error: { code: "ADMIN_REQUIRED", message: "Administrator access is required" },
    });
  }
  next();
};
