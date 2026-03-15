import { Request, Response, NextFunction } from "express";

import { validateCwlService } from "../services/validate.js";

export const validateCwlController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { cwl } = req.body;

    if (!cwl) {
      return res.status(400).json({
        error: "Missing document in request body",
      });
    }

    const result = await validateCwlService(cwl);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
