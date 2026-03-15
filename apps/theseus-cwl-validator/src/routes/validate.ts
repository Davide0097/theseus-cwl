import { Router } from "express";

import { validateCwlController } from "../controllers/validate.js";

const router = Router();

router.post("/validate", validateCwlController);

export default router;
