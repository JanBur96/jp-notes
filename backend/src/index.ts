import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import notesRouter from "./routes/notes.js";
import foldersRouter from "./routes/folders.js";
import aiRouter from "./routes/ai.js";

const app = express();
const PORT = 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/notes", notesRouter);
app.use("/api/folders", foldersRouter);
app.use("/api/ai", aiRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
