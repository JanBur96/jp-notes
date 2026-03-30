import prisma from "./db.js";

async function main() {
  // Folder erstellen
  const folder = await prisma.folder.create({
    data: { name: "Test Ordner" },
  });
  console.log("Folder:", folder);

  // Note erstellen
  const note = await prisma.note.create({
    data: {
      title: "Erste Note",
      content: "# Hello World",
      folderId: folder.id,
      tags: {
        connectOrCreate: [
          { where: { name: "test" }, create: { name: "test" } },
        ],
      },
    },
    include: { tags: true, folder: true },
  });
  console.log("Note:", note);

  // Alles auslesen
  const notes = await prisma.note.findMany({
    include: { tags: true, folder: true },
  });
  console.log("All notes:", notes);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
