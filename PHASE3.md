# Phase 3 — JP Notes

Phase 2 shipped the safety net: error handling, soft-delete, modals, optimistic updates, search wiring, and tags. Phase 3 is about making the app feel powerful and personal — knowledge graph, AI that earns its keep, and the kind of polish that turns a side project into something you actually live in.

---

## Carryover from Phase 2

These were on the Phase 2 backlog but didn't ship. Re-evaluate before starting Phase 3 work.

- **Auto-save** — debounce on content/title change (~1.5 s), with a "Saved ✓" indicator that fades. Removes the Save button entirely.
- **Note pinning UI** — `pinned` field exists on the model and the backend orders by it; just needs a pin button in the editor header.
- **Move note to folder** — dropdown in the editor header. `api.notes.update` already accepts `folderId`.
- **Note preview in list** — first non-empty line of content under the title. Strip markdown syntax.
- **Rename / delete folder** — UI for the existing `api.folders.update` / `api.folders.delete`.
- **Markdown toolbar** — Bold, Italic, Link, Code block buttons that dispatch into CodeMirror at the cursor.
- **Theme toggle** — light theme via overriding `:root` variables; persist to `localStorage`.
- **Drag-and-drop notes onto folders** — needs `dragstart`/`dragover`/`drop` and a `folderId` update.
- **Bulk operations** — checkbox-select notes for batch delete/move.

---

## Must Do

### Knowledge graph foundations

- **Wikilinks (`[[Note Title]]`)** — parse and render in the preview as clickable links that switch the active note. The hard part is autocomplete in the editor as you type `[[`. CodeMirror has an autocomplete extension (`@codemirror/autocomplete`) that pairs well with `store.notes`.

- **Backlinks pane** — a small section under the editor (or in a side panel) that lists every note linking to the current one. Computed client-side by scanning `store.notes` for the title pattern. Updates reactively.

- **Tag autocomplete + tag pages** — once Phase 2 ships tags, add autocomplete in the editor (`#`-triggered) and a click-through view that lists every note with a given tag. Tag rename / merge is a nice follow-up.

### Command palette

- **`Ctrl+K` quick switcher** — fuzzy search across notes, folders, and commands. Use `fzf`-style scoring (or the lightweight `fuse.js`). This becomes the primary navigation surface for power users — once it's there, you stop using the sidebar for jumps.

- **Slash commands in the editor** — typing `/` opens a menu: `/h1`, `/code`, `/quote`, `/today`, `/template`. Insert via CodeMirror dispatch.

### Real save story

- **Sync queue / offline first** — auto-save writes to an IndexedDB queue, a background worker drains the queue to the API. If you're offline, the queue holds; reconnect and it flushes. Combined with the existing mock layer, this gets you a real PWA.

- **Conflict handling** — when the server's `updatedAt` is newer than what the client based its edit on, prompt or auto-merge. Right now last-write-wins silently.

---

## Might Do

### AI that earns its keep

- **Chat with this note** — sidebar panel that opens an Ollama chat seeded with the current note's content. Useful for "explain this section", "draft a reply", "what am I missing".

- **Semantic search via embeddings** — embed each note (Ollama supports `nomic-embed-text` or similar), store vectors in SQLite (`sqlite-vss` or just a `Float32Array` blob column). Search becomes vector + keyword hybrid.

- **AI completion** — inline ghost-text suggestions as you type, accept with `Tab`. CodeMirror has `inlineSuggest` you can build on.

- **Daily summary** — a "Today" note that's auto-generated each morning from yesterday's edits. The Ollama backend already exists; just needs a scheduled job and a "Daily" pseudo-folder.

### Templates & daily notes

- **Templates** — a `Templates` folder where any note can be marked as a template. New-note dropdown lists them. Variables like `{{date}}`, `{{title}}` get expanded on insert.

- **Daily notes** — a calendar view in the sidebar; clicking a date opens (or creates) the daily note for that day. Date-based folder structure: `Daily/2026/04/2026-04-07.md`.

### Editor power features

- **Math (KaTeX)** — `$x^2$` inline and `$$...$$` block. The `marked-katex-extension` package wires this into the existing `marked` pipeline in one line.

- **Mermaid diagrams** — fenced code blocks with `mermaid` get rendered as SVG in the preview. Lazy-load mermaid so it doesn't bloat the bundle.

- **Footnotes, task lists, GFM tables** — `marked-gfm-heading-id`, `marked-footnote`. Most of these are one-extension installs.

- **Outline / table of contents** — a collapsible TOC sidebar generated from headings. Click to scroll.

- **Folding** — fold by heading level. CodeMirror has `foldGutter` + a markdown fold service.

### Settings & customization

- **Settings page** — font family, font size, line height, theme, default folder for new notes, auto-save interval. Persisted in `localStorage`. Lives in a modal opened from the toolbar.

- **Per-folder colors / icons** — small color dot or emoji in the sidebar. Stored on the folder model (needs a Prisma migration) or client-side in `localStorage` as a folder-id → color map.

### Export & import

- **Backup / restore** — "Export everything" button that bundles all notes + folders + tags into a `.zip` of markdown files (with frontmatter for metadata) and downloads it. Restore reads the same format.

- **Import from Obsidian / Notion / Apple Notes** — file/zip input that walks a folder tree of `.md` files. Frontmatter → tags + metadata.

- **Print / PDF export** — uses the existing markdown preview pipeline + `window.print()` with a print stylesheet. Optionally headless via the backend if you want server-side PDF.

---

## Nice Ideas

### Mobile & deployment

- **PWA install** — add a `manifest.json`, a service worker, and an icon set. The mock-API mode + IndexedDB queue make this a real installable offline app.

- **Capacitor wrap** — if you want a real iOS/Android shell, Capacitor wraps the existing Vite build with native shells. Mostly free given the offline-first work above.

- **Self-hostable Docker setup** — a `docker-compose.yml` with the backend + a volume for the SQLite file. One-command deploy for anyone who wants to run their own.

### Multi-user (future-proofing)

- **Auth** — only worth it if you ever plan to host this for others. `lucia-auth` is a small fit for the existing Express setup; magic-link login keeps it simple.

- **Read-only share links** — generate a public URL that renders one note as a static page. Cheap, doesn't require full multi-user.

### Dev infrastructure

- **Tests** — Vitest for the store (the optimistic-update + rollback paths are exactly the kind of thing that benefits from unit tests). Playwright for end-to-end (load app → create note → save → reload → still there).

- **Zod validation on API boundaries** — both backend `req.body` and frontend `request<T>` responses. Catches schema drift between frontend and backend before it becomes a runtime mystery.

- **Structured logging** — `pino` on the backend with request IDs. Useful when you start hosting it.

- **CI** — GitHub Actions that runs `tsc --noEmit`, `vitest run`, and `playwright test` on every push. Lighthouse CI for a11y / perf budget.

### Random small wins

- **Image attachments** — drag an image into the editor → uploads to `backend/uploads/`, inserts `![](url)` at the cursor. R2 / S3 if you go cloud.

- **Cover images** — optional banner at the top of a note. Stored as a URL in a new model field.

- **Frontmatter** — parse YAML frontmatter at the top of notes for metadata (`tags:`, `pinned:`, `created:`). Aligns with the export format above.

- **Word count goal** — set a target word count per note, show a progress bar. Surprisingly motivating.

- **Note version history** — keep last N snapshots server-side; restore via a "History" button. Storage is cheap compared to losing work.

- **Trash with auto-empty** — archived notes older than 30 days auto-delete. Configurable.

- **Custom CSS slot** — a settings field where the user pastes their own CSS that gets injected into the preview. Power users love this.

- **`jpnotes` CLI** — `jpnotes add "quick thought"` from anywhere. Just hits the existing API.

- **Browser extension** — clip the current page into a new note. Right-click → "Save to JP Notes". The backend already takes anonymous note creates.
