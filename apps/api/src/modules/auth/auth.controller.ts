import type { Request, Response } from "express";
import * as authService from "./auth.service";

export const loginController = async (req: Request, res: Response) => {
  const data = await authService.login();
  res.json(data);
};

export const meController = async (req: Request, res: Response) => {
  const data = await authService.getMe();
  res.json(data);
};