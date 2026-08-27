import type { Response } from "express";

type Meta = Record<string, unknown>;

export function responseOk<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Meta
) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function responseCreated<T>(
  res: Response,
  data: T,
  meta?: Meta
) {
  return responseOk(res, data, 201, meta);
}

export function responseFail(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}