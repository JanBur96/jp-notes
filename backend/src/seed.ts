import prisma from "./db.js";

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.note.deleteMany();
  await prisma.folder.deleteMany();

  // Folders
  const work = await prisma.folder.create({ data: { name: "Work" } });
  const personal = await prisma.folder.create({ data: { name: "Personal" } });
  const devNotes = await prisma.folder.create({
    data: { name: "Dev Notes", parentId: work.id },
  });

  // Notes
  await prisma.note.create({
    data: {
      title: "Getting started with Prisma",
      content: `# Getting started with Prisma

Prisma is a next-generation ORM for Node.js and TypeScript.

## Setup

\`\`\`bash
npm install prisma @prisma/client
npx prisma init
\`\`\`

## Key concepts

- **Schema** – define your data models in \`prisma/schema.prisma\`
- **Migrate** – \`npx prisma migrate dev\`
- **Client** – generated type-safe client
`,
      pinned: true,
      folderId: devNotes.id,
      archived: true,
    },
  });

  await prisma.note.create({
    data: {
      title: "Project ideas",
      content: `# Project ideas

- CLI tool for managing dotfiles
- Browser extension for saving bookmarks with tags
- Local-first note-taking app (in progress!)
- Recipe manager with ingredient tracking
`,
      folderId: personal.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "Q3 planning meeting",
      content: `# Q3 Planning

## Goals

- Ship v2 of the API
- Improve test coverage to 80%
- Onboard two new team members

## Action items

- [ ] Draft roadmap by Friday
- [ ] Schedule 1:1s with new hires
- [ ] Review open PRs
`,
      folderId: work.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "TypeScript tips",
      content: `# TypeScript tips

## Utility types

- \`Partial<T>\` – all fields optional
- \`Required<T>\` – all fields required
- \`Pick<T, K>\` – subset of fields
- \`Omit<T, K>\` – all fields except K
- \`Record<K, V>\` – object with keys K and values V

## satisfies operator

\`\`\`ts
const config = {
  port: 4000,
  host: "localhost",
} satisfies Record<string, string | number>;
\`\`\`
`,
      folderId: devNotes.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "Weekend todos",
      content: `# Weekend todos

- [ ] Groceries
- [ ] Fix bike
- [ ] Call parents
- [ ] Read chapter 4
`,
      folderId: personal.id,
    },
  });

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
