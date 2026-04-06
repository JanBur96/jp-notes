import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import prisma from "../db.js";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { folderId, tag, search, archived } = req.query;
    const where: any = { archived: archived === "true" };

    if (folderId) where.folderId = folderId as string;
    if (tag) where.tags = { some: { name: tag as string } };
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { content: { contains: search as string } },
      ];
    }

    const notes = await prisma.note.findMany({
      where,
      include: { tags: true, folder: true },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    });
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      include: { tags: true, folder: true },
    });
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, folderId, tags } = req.body;
    const data: any = { title, content };

    if (folderId) data.folder = { connect: { id: folderId } };
    if (tags?.length) {
      data.tags = {
        connectOrCreate: tags.map((name: string) => ({
          where: { name },
          create: { name },
        })),
      };
    }

    const note = await prisma.note.create({
      data,
      include: { tags: true, folder: true },
    });
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, folderId, tags, pinned, archived } = req.body;
    const data: any = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (pinned !== undefined) data.pinned = pinned;
    if (archived !== undefined) data.archived = archived;

    if (folderId) data.folder = { connect: { id: folderId } };
    else if (folderId === null) data.folder = { disconnect: true };

    if (tags) {
      data.tags = {
        set: [],
        connectOrCreate: tags.map((name: string) => ({
          where: { name },
          create: { name },
        })),
      };
    }

    const note = await prisma.note.update({
      where: { id: req.params.id },
      data,
      include: { tags: true, folder: true },
    });
    res.json(note);
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ error: "Note not found" });
    next(error);
  }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.note.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ error: "Note not found" });
    next(error);
  }
});

export default router;
