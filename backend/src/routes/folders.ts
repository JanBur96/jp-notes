import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import prisma from "../db.js";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const folders = await prisma.folder.findMany({ orderBy: { name: "asc" } });
    res.json(folders);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const folder = await prisma.folder.findUnique({ where: { id: req.params.id } });
    if (!folder) return res.status(404).json({ error: "Folder not found" });
    res.json(folder);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, parentId } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Folder name is required" });

    const data: any = { name: name.trim() };
    if (parentId) data.parentId = parentId;

    const folder = await prisma.folder.create({ data });
    res.status(201).json(folder);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, parentId } = req.body;
    const data: any = {};
    if (name) data.name = name;
    if (parentId) data.parentId = parentId;

    const folder = await prisma.folder.update({ where: { id: req.params.id }, data });
    res.json(folder);
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ error: "Folder not found" });
    next(error);
  }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.folder.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ error: "Folder not found" });
    next(error);
  }
});

export default router;
