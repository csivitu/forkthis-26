import type { Request, Response } from "express";
import * as userService from "./user.service.ts";

export const getProfileController = async (req: Request, res: Response) => {
  const data = await userService.getUserProfile();
  res.json(data);
};