import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import prisma from "../db.js";

const router = Router();

router.post(
  "/summarize/:noteId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { noteId } = req.params;

      const note = await prisma.note.findUnique({
        where: { id: noteId as string },
      });
      if (!note) return res.status(404).json({ error: "Note not found" });

      if (!note.content.trim()) {
        return res
          .status(400)
          .json({ error: "Cannot summarize an empty note" });
      }

      // Generous timeout for Ollama cold starts.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);

      let ollamaRes: globalThis.Response;
      try {
        const ollamaUrl = process.env.OLLAMA_URL ?? "http://localhost:11434";
        ollamaRes = await fetch(`${ollamaUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3.1:8b",
            prompt: `Summarize the following note concisely. Output only the summary (not too small) without any preamble or commentary:\n\n${note.content}`,
            stream: false,
          }),
          signal: controller.signal,
        });
      } catch (err) {
        clearTimeout(timeoutId);
        if ((err as Error).name === "AbortError") {
          return res.status(504).json({ error: "AI timeout" });
        }
        return res.status(503).json({ error: "AI unreachable" });
      }
      clearTimeout(timeoutId);

      if (!ollamaRes.ok) {
        return res
          .status(502)
          .json({ error: `AI service returned ${ollamaRes.status}` });
      }

      const data = (await ollamaRes.json()) as { response?: string };
      res.json({ summary: data.response?.trim() ?? "" });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
