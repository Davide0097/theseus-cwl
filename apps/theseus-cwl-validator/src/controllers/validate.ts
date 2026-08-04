import { Request, Response, NextFunction } from "express";

import type { CwlSource } from "@theseus-cwl/types";

import { cwlSourceSchema } from "../schema.js";
import { validateCwlService } from "../services/validate.js";

export const validateCwlController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = cwlSourceSchema.safeParse(req.body?.cwl);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid CWL source payload",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
      });
    }

    // zod has verified the structural shape; content is intentionally opaque.
    const result = await validateCwlService(parsed.data as CwlSource);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
