import { Router } from "express";
import prisma from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { notes: true } } },
    });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: req.params.id },
    });
    if (!tag) return res.status(404).json({ error: "Tag not found" });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tag" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await prisma.tag.create({
      data: { name },
    });
    res.json(tag);
  } catch (error) {
    res.status(400).json({ error: "Failed to create tag" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await prisma.tag.update({
      where: { id: req.params.id },
      data: { name },
    });
    res.json(tag);
  } catch (error) {
    res.status(400).json({ error: "Failed to update tag" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.tag.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Tag deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete tag" });
  }
});

export default router;
