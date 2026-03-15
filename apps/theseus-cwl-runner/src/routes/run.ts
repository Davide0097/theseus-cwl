import { Router } from "express";

import {
  getRunLogsController,
  getRunOutputsController,
  getRunsController,
  getRunStatusController,
  runController,
} from "../controllers/run.js";

const router = Router();

router.post("/run", runController);

router.get("/run/:id/status", getRunStatusController);

router.get("/run/:id/logs", getRunLogsController);

router.get("/run/:id/outputs", getRunOutputsController);

router.get("/runs", getRunsController);

export default router;
