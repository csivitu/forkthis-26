import type { Request, Response } from "express";
import { moduleService } from "./module.service";
import type { ModuleRequest } from "./module.types.ts";

export const moduleController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data: ModuleRequest = req.body;

    const result = await moduleService(data);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};