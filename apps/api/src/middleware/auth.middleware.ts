import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.config";

export interface AuthRequest extends Request {
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
      error:
        "UNAUTHENTICATED"
    });
  }

  if (!session.user.githubId) {
    return res.status(403).json({
      error:
        "GITHUB_LINK_REQUIRED"
    });
  }

  req.user = session.user;
  next();
};