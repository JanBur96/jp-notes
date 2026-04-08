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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.1:8b",
          prompt: `Summarize the following note concisely. Output only the summary (not too small) without any preamble or commentary:\n\n${note.content}`,
          stream: false,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Ollama API error: ${response.status}`);
      const data = await response.json();
      res.json({ summary: data.response?.trim() ?? "" });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
