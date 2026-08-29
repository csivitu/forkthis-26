import type { Request, Response, NextFunction } from "express";
import { moduleService } from "./module.service";
import type { ModuleRequest } from "./module.types.ts";

export const moduleController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: ModuleRequest = req.body;

    const result = await moduleService(data);

    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};