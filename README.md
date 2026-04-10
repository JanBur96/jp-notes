# jp-notes

A local-first notes app. Svelte 5 + Express + Prisma/SQLite, with an optional
Ollama summarise button.

Two processes:

```
backend/   express + prisma, :4000
frontend/  vite + svelte 5, :5173
```

## Run it

```sh
# backend
cd backend
npm install
npx prisma migrate deploy
npm run seed   # optional: demo notes
npm run dev

# frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

The summarise button hits `http://localhost:11434/api/generate` (Ollama,
`llama3.1:8b`). If you don't have Ollama running, the button errors with
"AI unreachable" and everything else still works.

## Demo mode

Build the frontend with `VITE_DEMO=true` to run it with no backend at all:

```sh
cd frontend
VITE_DEMO=true npm run build
npm run preview
```

State is persisted to `localStorage` under `jp-notes-demo`.

## Stack

- Svelte 5 (runes, no SvelteKit) + Vite
- Express
- Prisma + SQLite (libsql)
- CodeMirror 6 for the editor
- marked + DOMPurify for the preview
- Ollama for the summarise button

## Tools

I used [Claude Code](https://claude.ai/code) as a coding assistant throughout this project. The architecture, design decisions, and core logic are mine... Claude helped me move faster on the stuff that would otherwise just eat time: wiring up Prisma migrations, getting Express validation right, figuring out why a CSS stacking context was swallowing my mobile overlay, writing the `marked` tokenizer extension for wikilinks, and replacing `any` types with proper Prisma generics across the API routes. Basically anywhere I'd normally be tab-switching between docs and Stack Overflow, I used Claude instead. It's a great tool, which I recommend.
