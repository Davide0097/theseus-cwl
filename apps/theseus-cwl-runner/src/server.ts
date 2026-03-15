import express from "express";
import cors from "cors";

import routes from "./routes/run.js";
import { errorMiddleware } from "./middleware/run.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api/v1/cwl/runs", express.static("runs"));
app.use("/api/v1/cwl", routes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3004;

app.listen(PORT, () =>
  console.log(`CWL Runner running on http://localhost:${PORT}`),
);
