import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import prisma from "../db.js";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { folderId, search, archived } = req.query;
    const where: Prisma.NoteWhereInput = { archived: archived === "true" };

    if (folderId) where.folderId = folderId as string;
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { content: { contains: search as string } },
      ];
    }

    const notes = await prisma.note.findMany({
      where,
      include: { folder: true },
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
      include: { folder: true },
    });
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, folderId } = req.body;
    if (typeof title !== "string" || typeof content !== "string") {
      return res.status(400).json({ error: "title and content required" });
    }
    if (content.length > 1_000_000) {
      return res.status(413).json({ error: "Content too large" });
    }
    const data: Prisma.NoteCreateInput = {
      title,
      content,
      ...(folderId ? { folder: { connect: { id: folderId } } } : {}),
    };

    const note = await prisma.note.create({
      data,
      include: { folder: true },
    });
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, folderId, pinned, archived } = req.body;
    if (title !== undefined && typeof title !== "string") {
      return res.status(400).json({ error: "title must be a string" });
    }
    if (content !== undefined) {
      if (typeof content !== "string") {
        return res.status(400).json({ error: "content must be a string" });
      }
      if (content.length > 1_000_000) {
        return res.status(413).json({ error: "Content too large" });
      }
    }
    const data: Prisma.NoteUpdateInput = {
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(pinned !== undefined ? { pinned } : {}),
      ...(archived !== undefined ? { archived } : {}),
      ...(folderId ? { folder: { connect: { id: folderId } } } : {}),
      ...(folderId === null ? { folder: { disconnect: true } } : {}),
    };

    const note = await prisma.note.update({
      where: { id: req.params.id },
      data,
      include: { folder: true },
    });
    res.json(note);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025")
      return res.status(404).json({ error: "Note not found" });
    next(error);
  }
});

router.delete("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.query.archived !== "true") {
      return res
        .status(400)
        .json({ error: "archived=true query parameter required" });
    }
    await prisma.note.deleteMany({ where: { archived: true } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.note.delete({ where: { id: req.params.id } });
      res.status(204).end();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025")
        return res.status(404).json({ error: "Note not found" });
      next(error);
    }
  },
);

export default router;
