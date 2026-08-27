import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    [key: string]: unknown;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers["authorization"] || req.headers["Authorization"];

  if (!authorization || typeof authorization !== "string") {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : authorization;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    }) as { id: number; email: string };

    req.user = decoded;
    next();
  } catch (err) {
    console.error("authMiddleware error", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};