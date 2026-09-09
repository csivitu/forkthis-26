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
  const session = await auth.api.getSession({ headers:
    fromNodeHeaders(req.headers)  });

    if (!session){
      return res.status(401).json({ error:
        "UNAUTHENTICATED"});
    }

    if(!session.user.githubId) {
      return res.status(403).json({ error:
        "GITHUB_LINK_REQUIRED"});
    }

    req.user = session.user;
    next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== userRole.Admin) {
     console.log("req.user in requireAdmin:", req.user);
    return res.status(403).json({error: "ADMIN_REQUIRED"});
  }
  next();
};