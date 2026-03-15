import express from "express";
import cors from "cors";

import routes from "./routes/validate.js";
import { errorMiddleware } from "./middleware/validate.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use("/api/v1/cwl", routes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`CWL Validator running on http://localhost:${PORT}`);
});
