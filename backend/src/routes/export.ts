import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import prisma from "../db.js";
import archiver from "archiver";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notes = await prisma.note.findMany({
      include: { folder: true },
    });

    const archive = archiver("zip", { zlib: { level: 9 } });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=notes.zip");

    archive.pipe(res);

    notes.forEach((note) => {
      const folder = note.folder?.name ?? "Unsorted";
      const title = note.title || "Untitled";
      archive.append(note.content, { name: `${folder}/${title}.md` });
    });

    archive.finalize();
  } catch (error) {
    next(error);
  }
});

export default router;
