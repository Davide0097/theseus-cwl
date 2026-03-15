import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Theseus-cwl-runner: Internal Server Error",
  });
};
