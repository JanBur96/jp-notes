import { Router } from "express";
import prisma from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const folders = await prisma.folder.findMany({
    orderBy: { name: "asc" },
  });
  res.json(folders);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const folder = await prisma.folder.findUnique({
    where: { id },
  });
  if (!folder) {
    return res.status(404).json({ error: "Folder not found" });
  }
  res.json(folder);
});

router.post("/", async (req, res) => {
  const { name, parentId } = req.body;

  const data: any = {
    name,
  };

  if (parentId) {
    data.parentId = parentId as string;
  }

  const folder = await prisma.folder.create({
    data,
  });
  res.status(201).json(folder);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, parentId } = req.body;
  const data: any = {};

  if (name) {
    data.name = name;
  }

  if (parentId) {
    data.parentId = parentId as string;
  }

  const folder = await prisma.folder.update({
    where: { id },
    data,
  });
  res.json(folder);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.folder.delete({
    where: { id },
  });

  res.status(204).send();
});

export default router;
