import { Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import path from "path";

import { runCwlService } from "../services/run.js";

export const runController = async (
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
    const runId = await runCwlService(cwl || {});

    return res.status(200).json({ runId, status: "queued" });
  } catch (error) {
    next(error);
  }
};

export const getRunStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = path.join("runs", req.params.id as string, "status.json");
    const data = await fs.readFile(file, "utf8");

    res.json(JSON.parse(data));
  } catch (err) {
    next(err);
  }
};

export const getRunLogsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dir = path.join("runs", req.params.id as string);

    const stdout = await fs.readFile(path.join(dir, "stdout.log"), "utf8");
    const stderr = await fs.readFile(path.join(dir, "stderr.log"), "utf8");

    res.json({ stdout, stderr });
  } catch (err) {
    next(err);
  }
};

export const getRunOutputsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = path.join("runs", req.params.id as string, "outputs.json");

    const data = await fs.readFile(file, "utf8");

    res.json(JSON.parse(data));
  } catch (err) {
    res.status(404).json({ error: "Outputs not found" });
  }
};

export const getRunsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const runsDir = path.join(process.cwd(), "runs");

    const runIds = await fs.readdir(runsDir);

    const runs = await Promise.all(
      runIds.map(async (id) => {
        const statusFile = path.join(runsDir, id, "status.json");
        const logsFile = path.join(runsDir, id, "stdout.log");
        const outputsFile = path.join(runsDir, id, "outputs.json");

        const status = JSON.parse(await fs.readFile(statusFile, "utf8"));
        const logs = await fs.readFile(logsFile, "utf8");

        let outputs = {};
        try {
          outputs = JSON.parse(await fs.readFile(outputsFile, "utf8"));
        } catch {}

        return {
          runId: id,
          status,
          logs,
          outputs,
        };
      }),
    );

    res.json(runs);
  } catch (err) {
    next(err);
  }
};
