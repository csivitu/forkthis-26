import type { Request, Response } from "express";
import { analyzeGithub } from "./analyze.service";

export const analyzeProfile = async (req: Request, res: Response) => {
  const { username } = req.body;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "username is required in request body" });
  }

  try {
    const data = await analyzeGithub(username);
    res.json(data);
  } catch (err) {
    console.error("analyzeProfile failed", err);
    res.status(502).json({ error: "Failed to analyze GitHub profile" });
  }
};