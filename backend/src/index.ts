import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "node:path";
import notesRouter from "./routes/notes.js";
import foldersRouter from "./routes/folders.js";
import aiRouter from "./routes/ai.js";
import exportRouter from "./routes/export.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/notes", notesRouter);
app.use("/api/folders", foldersRouter);
app.use("/api/ai", aiRouter);
app.use("/api/export", exportRouter);

// When FRONTEND_DIST is set (production container), serve the built SPA
// from the same origin so /api/* and / share a host.
const frontendDist = process.env.FRONTEND_DIST;
if (frontendDist) {
  const distPath = path.resolve(frontendDist);
  app.use(express.static(distPath));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
