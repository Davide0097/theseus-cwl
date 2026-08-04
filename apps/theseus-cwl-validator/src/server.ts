import express from "express";
import cors from "cors";

import routes from "./routes/validate.js";
import { errorMiddleware } from "./middleware/validate.js";

const app = express();

// Restrict CORS to ALLOWED_ORIGINS (comma-separated) when set; otherwise stay
// permissive so local dev / the IDE keep working out of the box.
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors(
    allowedOrigins && allowedOrigins.length > 0
      ? { origin: allowedOrigins }
      : undefined,
  ),
);
app.use(express.json({ limit: "5mb" }));

app.use("/api/v1/cwl", routes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`CWL Validator running on http://localhost:${PORT}`);
});
