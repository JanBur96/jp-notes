# JP Notes — Codebase Deep Dive

A personal notes app built full-stack from scratch. This document walks through every layer of the project: the architecture choices, the patterns used, and the "why" behind the decisions. Read it top to bottom or jump to whatever you want to revisit.

---

## Table of Contents

1. [Project Shape](#1-project-shape)
2. [The Backend](#2-the-backend)
3. [The Database Layer — Prisma + SQLite](#3-the-database-layer--prisma--sqlite)
4. [The API Layer — Express Routes](#4-the-api-layer--express-routes)
5. [The Frontend — Svelte 5](#5-the-frontend--svelte-5)
6. [State Management — The Store](#6-state-management--the-store)
7. [The API Client](#7-the-api-client)
8. [Component Breakdown](#8-component-breakdown)
9. [The CSS Architecture](#9-the-css-architecture)
10. [The Flex Layout System](#10-the-flex-layout-system)
11. [CodeMirror 6](#11-codemirror-6)
12. [The AI Feature](#12-the-ai-feature)
13. [Patterns Worth Remembering](#13-patterns-worth-remembering)

---

## 1. Project Shape

```
jp-notes/
├── backend/          Node.js + Express + Prisma
│   ├── src/
│   │   ├── index.ts          Entry point, app setup
│   │   ├── db.ts             Prisma client singleton
│   │   └── routes/
│   │       ├── notes.ts      CRUD for notes
│   │       ├── folders.ts    CRUD for folders
│   │       ├── tags.ts       Tag endpoints
│   │       └── ai.ts         Summarization via Ollama
│   └── prisma/
│       └── schema.prisma     Data model
└── frontend/
    └── src/
        ├── main.ts           Entry, imports CSS globally
        ├── App.svelte         Root component, layout shell
        ├── app.css            Global styles, layout tokens
        ├── markdown.css       Editor + preview styles
        └── lib/
            ├── store.svelte.ts   Global reactive state + actions
            ├── api.ts             HTTP client + TypeScript types
            ├── api.mock.ts        Fully working offline mock
            ├── NoteEditor.svelte  The editor pane (CodeMirror)
            ├── NoteList.svelte    Middle pane — note list
            ├── Sidebar.svelte     Left pane — folder tree
            ├── FolderTree.svelte  Recursive folder component
            └── Modal.svelte       Generic modal wrapper
```

The project is split into two completely separate Node processes that communicate over HTTP. The backend runs on port `4000`, the frontend dev server proxies `/api/*` to it (or you can set up Vite's proxy). This separation means you could swap either side independently.

---

## 2. The Backend

```typescript
// backend/src/index.ts
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/notes",   notesRouter);
app.use("/api/folders", foldersRouter);
app.use("/api/tags",    tagsRouter);
app.use("/api/ai",      aiRouter);

app.use((err, req, res, next) => {         // ← global error handler
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
```

**Why Express?** It's the least-surprising option for a simple REST API. Nothing fancy needed here — you're not building a framework.

**Why the global error handler at the bottom?** Express identifies a 4-argument middleware as an error handler. Any `next(error)` call in any route skips straight to this function. All your route handlers use `try/catch` and call `next(error)` on failure, so errors always bubble here instead of crashing the process or sending inconsistent responses.

**`app.use(express.json())`** — this middleware parses the `Content-Type: application/json` body of incoming requests and puts the result in `req.body`. Without it, `req.body` is always `undefined`.

---

## 3. The Database Layer — Prisma + SQLite

### The Schema

```prisma
model Folder {
  id       String   @id @default(cuid())
  name     String
  parentId String?          // nullable — top-level folders have no parent
  parent   Folder?  @relation("FolderTree", fields: [parentId], references: [id])
  children Folder[] @relation("FolderTree")
  notes    Note[]
}

model Note {
  id        String    @id @default(cuid())
  title     String
  content   String
  pinned    Boolean   @default(false)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt       // Prisma auto-updates this
  folderId  String?
  folder    Folder?   @relation(fields: [folderId], references: [id])
  tags      Tag[]
  archived  Boolean   @default(false)
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  notes Note[]
}
```

**IDs are CUIDs, not auto-increment integers.** CUIDs (`cuid()`) are collision-resistant, sortable, URL-safe strings. They're better than UUIDs for database performance (sortable) and better than integers for public-facing APIs (non-guessable).

**Self-referential relation (`FolderTree`).** The `Folder` model refers to itself via `parentId`. Prisma requires you to name self-relations explicitly — hence `@relation("FolderTree")` on both sides. A folder with `parentId = null` is a root folder. A folder with a `parentId` is a child of that folder.

**`@updatedAt`** is a Prisma directive that automatically sets the field to the current timestamp whenever the record is updated. You never have to touch it manually.

**Many-to-many: Notes ↔ Tags.** The `tags Tag[]` on `Note` and `notes Note[]` on `Tag` create an implicit join table. Prisma handles this automatically — no junction model needed unless you want extra fields on the relationship.

**`archived` instead of `deletedAt`.** The `deletedAt` field exists in the schema but isn't used — instead `archived: Boolean` is used as a soft-delete mechanism. Archived notes are hidden from normal view but not permanently gone. True deletion only happens through an explicit second action.

### The Prisma Client

```typescript
// backend/src/db.ts
import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:./jp-notes.db" });
const prisma = new PrismaClient({ adapter });

export default prisma;
```

**Why LibSQL?** SQLite is a file-based database — perfect for a local personal app, no server needed. `@prisma/adapter-libsql` is Prisma's adapter for LibSQL (a fork of SQLite). The `file:./jp-notes.db` URL tells it to store the database as a local file.

**Singleton export.** The file creates one `PrismaClient` and exports it. Every route file imports the same instance. If you created a new `PrismaClient` in every route, you'd open a new database connection on every request — wasteful and eventually exhausting connection limits.

---

## 4. The API Layer — Express Routes

### Router Pattern

```typescript
// backend/src/routes/notes.ts
const router = Router();

router.get("/", async (req, res, next) => { ... });
router.get("/:id", async (req, res, next) => { ... });
router.post("/", async (req, res, next) => { ... });
router.put("/:id", async (req, res, next) => { ... });
router.delete("/:id", async (req, res, next) => { ... });

export default router;
```

Each resource (notes, folders, tags) lives in its own file and exports its own `Router`. The main `index.ts` mounts them under their respective paths. This is called **resource-based routing** — each file owns everything about one type of data.

### Prisma Query Patterns

**Filtering notes:**
```typescript
const where: any = { archived: archived === "true" };
if (folderId) where.folderId = folderId;
if (search) {
  where.OR = [
    { title: { contains: search } },
    { content: { contains: search } },
  ];
}
const notes = await prisma.note.findMany({
  where,
  include: { tags: true, folder: true },   // join relations
  orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
});
```

`include` tells Prisma to JOIN and attach related records. Without `include: { folder: true }`, `note.folder` would be `undefined`. The `orderBy` array pins notes to the top, then sorts by most recently updated.

**Connecting/disconnecting relations:**
```typescript
// Connect a folder
if (folderId) data.folder = { connect: { id: folderId } };
// Disconnect a folder
else if (folderId === null) data.folder = { disconnect: true };
```

Prisma relations aren't set by directly writing the FK (`folderId = "x"`). You use `connect` to link to an existing record, `disconnect` to remove the link, and `create` to create a new related record in one shot.

**Tags — `connectOrCreate`:**
```typescript
data.tags = {
  set: [],                     // first, clear existing tags
  connectOrCreate: tags.map((name) => ({
    where: { name },           // find by unique field
    create: { name },          // if not found, create it
  })),
};
```

`connectOrCreate` is a clean upsert pattern. Instead of "find the tag, if it doesn't exist create it, then link it", you express the entire intent in one Prisma operation.

**Error code `P2025`:**
```typescript
if (error.code === "P2025") return res.status(404).json({ error: "Not found" });
```

Prisma throws a known error code when `update` or `delete` targets a record that doesn't exist. Checking for `P2025` lets you return a proper 404 instead of a 500.

---

## 5. The Frontend — Svelte 5

The frontend uses **Svelte 5** with the new **Runes** API. Runes replace the old `$:` reactive declarations and Svelte stores with explicit compiler primitives.

### The Four Runes You Used

**`$state`** — declares reactive state. When it changes, anything that reads it updates.
```typescript
let count = $state(0);
count++;  // triggers re-render
```

**`$derived`** — computed value. Re-runs automatically when its dependencies change.
```typescript
const double = $derived(count * 2);
// equivalent to $: double = count * 2  in Svelte 4
```

**`$effect`** — side effects. Runs after the DOM updates, re-runs when its dependencies change. Returns an optional cleanup function.
```typescript
$effect(() => {
  document.title = `Count: ${count}`;
  return () => { document.title = 'App'; };  // cleanup
});
```

**`$props`** — declares component props. Replaces `export let`.
```typescript
let { name, age = 0 } = $props<{ name: string; age?: number }>();
```

### Why Runes Are Better Than Svelte 4

In Svelte 4, reactivity was implicit and magical — the compiler tracked which variables you used and made them reactive. Runes make reactivity **explicit and portable**. The key proof: `store.svelte.ts` — reactive state defined in a plain `.ts` file, outside any component. In Svelte 4 this required a custom store. In Svelte 5 you just use `$state`.

---

## 6. State Management — The Store

```typescript
// frontend/src/lib/store.svelte.ts
export const store = $state({
  notes: [] as Note[],
  folders: [] as Folder[],
  activeNoteId: null as string | null,
  activeFolderId: null as string | null,
  mobilePane: 'sidebar' as 'sidebar' | 'list' | 'editor',
  hasError: '',
  modal: null as ModalState,
  archiveMode: false,
  archivedNotes: [] as Note[],
  aiLoading: false,
  aiSummary: '' as string,
});
```

This is a **single global store** — one object that holds all application state. Every component imports from here. This avoids prop-drilling (passing data down through many layers) and keeps your data model in one place.

### Optimistic Updates

The `saveNote` function shows a classic optimistic update pattern:

```typescript
export async function saveNote(id: string, data: { title?: string; content?: string }) {
  const idx = store.notes.findIndex((n) => n.id === id);
  const prev = idx !== -1 ? { ...store.notes[idx] } : null;   // save snapshot

  try {
    if (idx !== -1) Object.assign(store.notes[idx], data);    // update UI immediately
    await api.notes.update(id, data);                          // then hit the server
  } catch (error) {
    if (prev && idx !== -1) Object.assign(store.notes[idx], prev);  // rollback on failure
    store.hasError = 'Failed to save note';
  }
}
```

**Optimistic update** means you update the UI *before* the server confirms it. The user sees the change instantly. If the server fails, you roll back. This makes the app feel fast even over a slow network.

### The Archive/Delete Pattern

```typescript
export async function deleteNote(id: string) {
  const note = store.notes.find((n) => n.id === id) ??
               store.archivedNotes.find((n) => n.id === id);

  if (note?.archived) {
    // already archived → truly delete
    await api.notes.delete(id);
  } else {
    // active note → archive it (soft delete)
    await archiveNote(id);
  }
}
```

"Delete" from the active list means archive. "Delete" from the archive means permanently destroy. This is the same pattern used by Gmail and most professional note apps — you rarely want to immediately and irreversibly lose data.

### The Modal State Type

```typescript
type ModalState =
  | null
  | { kind: 'create-folder'; name: string }
  | { kind: 'confirm-delete-note' };
```

This is a **discriminated union** — a TypeScript pattern for state that can be one of several named variants. `store.modal` is either null (no modal) or an object with a `kind` property. In the template you check `store.modal?.kind === 'create-folder'` which also narrows the type — TypeScript then knows the object has a `name` field. No need for separate boolean flags like `isCreateFolderOpen`, `isDeleteNoteOpen`.

---

## 7. The API Client

### The `request` Helper

```typescript
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}
```

All HTTP calls funnel through one generic function. The `<T>` type parameter lets callers tell TypeScript what the response shape will be. The `204 No Content` check handles DELETE responses — `res.json()` on an empty body throws an error.

### The Mock/Real Toggle

```typescript
export const api = import.meta.env.VITE_DEMO === 'true' ? mockApi : realApi;
```

`import.meta.env` is Vite's way of reading environment variables. Variables prefixed with `VITE_` are exposed to the browser bundle. This single line switches the entire API layer between a real HTTP backend and a fully in-memory mock. The mock implements the same interface as `realApi`, so the rest of the codebase never knows the difference.

**Why a mock at all?** It lets you run the frontend with `VITE_DEMO=true` and demo/develop it without needing the backend running. It also makes the app deployable as a static site. The mock persists to `localStorage` so it survives page refreshes.

---

## 8. Component Breakdown

### App.svelte — The Shell

`App.svelte` is the orchestrator. It:
- Calls `loadNotes()`, `loadFolders()`, `loadArchivedNotes()` on mount
- Renders the three-pane layout (`<Sidebar>`, `<NoteList>`, `<NoteEditor>`)
- Owns the modal rendering
- Owns the toolbar buttons

It doesn't do much itself — it delegates to the store and child components.

### FolderTree.svelte — Recursive Component

```svelte
<script lang="ts">
  import Self from './FolderTree.svelte';  // ← imports itself

  let { folders, parentId = null, activeFolderId, onSelect } = $props();

  const children = $derived(
    folders.filter((f) => f.parentId === parentId)
  );
</script>

{#each children as folder}
  {#if hasChildren}
    <details>
      <summary onclick={() => onSelect(folder.id)}>{folder.name}</summary>
      <ul>
        <Self {folders} parentId={folder.id} {activeFolderId} {onSelect} />
      </ul>
    </details>
  {:else}
    <button onclick={() => onSelect(folder.id)}>{folder.name}</button>
  {/if}
{/each}
```

This is a **recursive component** — it renders itself. On each level, it filters the flat `folders` array to only its direct children (`f.parentId === parentId`). If a folder has children, it renders a `<details>/<summary>` (native collapsible). If not, a plain `<button>`.

**Key insight:** The full folder tree is passed down as a flat array on every level, not a pre-built tree structure. Each level filters what it needs. This is simpler than transforming the array into a tree first — the filtering cost is negligible.

**`import Self from './FolderTree.svelte'`** — Svelte allows components to import themselves by aliasing the import. This is the idiomatic way to do recursion in Svelte.

### NoteEditor.svelte — CodeMirror + Preview

The editor component manages:
- CodeMirror instance lifecycle (create/destroy on note switch)
- Two-way binding between CM state and `content`
- Preview toggle (inline split-pane on desktop, full-screen overlay on mobile)
- AI summary toggle
- Save/delete actions

---

## 9. The CSS Architecture

### Two CSS Files, Different Purposes

**`app.css`** — global layout and UI tokens. Variables, toolbar, the three-pane flex layout, note list items, status bar, modal. This is the "chrome" of the app.

**`markdown.css`** — everything specific to the editor and preview: CodeMirror overrides, the split-pane panel, preview overlay, and all the markdown rendering styles (headings, code blocks, tables, etc.).

Both are imported in `main.ts` (not inside a `.svelte` file), making them **global CSS** — no Svelte scoping applied.

### The `:global()` Trap in Plain CSS Files

You'll see rules like this in `markdown.css`:

```css
.editor-body :global(.cm-editor) { height: 100%; }
```

**`:global()` is Svelte syntax, not CSS syntax.** It's only meaningful inside a `<style>` block in a `.svelte` file, where Svelte would otherwise scope every selector with a hash. Since `markdown.css` is a plain CSS file imported from `main.ts`, `:global()` is an unknown pseudo-class — the browser either ignores it or treats it as invalid.

However, Vite's processing pipeline may strip it silently — meaning the rule might work in development but behave unpredictably elsewhere. The safe version is to just write the plain selector:

```css
.editor-body .cm-editor { height: 100%; }
```

This works fine because `.cm-editor` is a class added by CodeMirror's JavaScript — it has no Svelte hash and will always match a plain CSS selector.

### CSS Custom Properties (Variables)

```css
:root {
  --bg: #080f1a;
  --surface: #0d1624;
  --accent: #c09030;
  --text: #d8e4f2;
  --text-2: #607898;
  --radius: 6px;
}
```

All colors and radii live in `:root` as CSS custom properties. When you write `color: var(--text-2)` anywhere in the codebase, changing `--text-2` in one place updates everything. This is the native CSS alternative to Sass variables.

---

## 10. The Flex Layout System

The three-pane layout is built entirely with flexbox. Understanding the hierarchy is key:

```
html/body/#app  →  height: 100vh; overflow: hidden
  .app-shell    →  display: flex; flex-direction: column    (full height column)
    .toolbar    →  flex-shrink: 0                           (fixed height)
    .app-body   →  display: flex; flex: 1; overflow: hidden (fills remaining height)
      .pane-sidebar  →  width: 200px; flex-shrink: 0        (fixed width)
      .pane-list     →  width: 240px; flex-shrink: 0        (fixed width)
      .pane-editor   →  flex: 1; overflow: hidden           (fills remaining width)
        .editor-inner  →  flex: 1; max-width: 820px; min-width: 0
          .editor-panels  →  display: flex; flex: 1; min-height: 0
            .editor-body   →  flex: 1; min-width: 0
            .preview-body  →  flex: 1; min-width: 0  (when preview open)
    .status-bar   →  flex-shrink: 0
```

### The `min-width: 0` / `min-height: 0` Rules

Flexbox has a quirk: by default, flex items have `min-width: auto` and `min-height: auto`. This means a flex item **refuses to shrink below the size of its content**. This breaks layouts constantly.

The fix: `min-width: 0` on the flex item allows it to shrink below content size. You saw this bug in action — the `.editor-body` was missing `min-width: 0`, so it held its full CodeMirror width and pushed the preview pane out of view.

Same problem in the vertical direction: `min-height: 0` on `.editor-panels` allows the flex column inside `.editor-inner` to shrink correctly so CodeMirror's `height: 100%` actually works.

**Rule of thumb:** Any flex item that needs to shrink below its content size — especially those containing variable-width content like a code editor — needs `min-width: 0` (or `min-height: 0` for column layouts).

### `flex: 1` Explained

`flex: 1` is shorthand for:
```
flex-grow: 1    → grow to fill available space
flex-shrink: 1  → shrink if needed
flex-basis: 0%  → start from zero, not from content size
```

When two siblings both have `flex: 1`, they split the available space 50/50. This is how the split-pane editor + preview works.

### `overflow: hidden` on the Container

`.app-body`, `.pane-editor` have `overflow: hidden`. This does two things:
1. Prevents children from overflowing the visible area (no horizontal scrollbar on the whole page)
2. Establishes a clip boundary for content — scroll behavior is pushed into leaf panes (`.cm-scroller` handles its own scroll)

**Important:** `overflow: hidden` on an ancestor breaks `position: sticky` on descendants. This is why the CodeMirror gutter (which uses `position: sticky; left: 0`) needed a solid background color — when horizontally scrolled, the sticky gutter floats over the scrolled content. Without a background, content text bleeds through the transparent gutter.

---

## 11. CodeMirror 6

### Setup

```typescript
view = new EditorView({
  parent: editorContainer,
  state: EditorState.create({
    doc: activeNote.content,
    extensions: [
      basicSetup,
      markdown(),
      updateListener,
      EditorView.lineWrapping,
    ],
  }),
});
```

**`basicSetup`** is a convenience bundle — it includes line numbers, bracket matching, selection history, search/replace, and many other sensible defaults.

**`markdown()`** is the language extension. It enables markdown syntax highlighting.

**`EditorView.lineWrapping`** enables soft line wrapping — long lines wrap visually instead of requiring horizontal scroll.

**`updateListener`** is a custom extension that fires every time the document changes:

```typescript
const updateListener = EditorView.updateListener.of((update) => {
  if (update.docChanged) {
    content = update.state.doc.toString();
  }
});
```

This bridges CodeMirror's internal state into Svelte's reactive state. When `content` updates, `previewHtml` (a `$derived`) recalculates automatically.

### Lifecycle Management

```typescript
$effect(() => {
  if (activeNote) {
    view?.destroy();   // always destroy the old view first
    view = new EditorView({ ... });
  } else {
    view?.destroy();
    view = null;
  }
});

$effect(() => {
  return () => view?.destroy();   // cleanup when component unmounts
});
```

CodeMirror views hold DOM references and event listeners. You must call `.destroy()` when you're done with them. The first `$effect` destroys and recreates the view when the active note changes. The second `$effect` only returns a cleanup function — it runs when the component unmounts and ensures no memory leak.

---

## 12. The AI Feature

### Backend — Ollama Integration

```typescript
const response = await fetch("http://localhost:11434/api/generate", {
  method: "POST",
  body: JSON.stringify({
    model: "llama3.1:8b",
    prompt: `Summarize the following note...\n\n${note.content}`,
    stream: false,
  }),
});
const data = await response.json();
res.json({ summary: data.response?.trim() ?? "" });
```

The backend calls a locally-running **Ollama** instance (an open-source LLM runner). The backend is the intermediary — the frontend never talks to Ollama directly, which means you can swap the AI provider later without touching the frontend.

### Frontend — Loading State Pattern

```typescript
export function summarizeNote(id: string) {
  store.aiLoading = true;
  api.ai.summarize(id)
    .then((res) => { store.aiSummary = res.summary; })
    .catch((error) => { store.hasError = 'Failed to summarize note'; })
    .finally(() => { store.aiLoading = false; });
}
```

**`.finally()`** runs whether the promise resolved or rejected — the loading state is cleared either way. This is the correct pattern for async loading flags: set to `true` before the request, clear in `.finally()` regardless of outcome.

### UI — The Toggleable Summary Bar

The summary panel uses a three-state display:
- **Hidden** — when `!store.aiLoading && !store.aiSummary`
- **Loading** — spinner + "Generating summary..."
- **Done** — clickable header that expands/collapses the text

The auto-open on completion:
```typescript
$effect(() => {
  if (store.aiSummary && !store.aiLoading) {
    showSummary = true;
  }
});
```

This `$effect` watches `store.aiSummary`. When it changes from empty to a value (and loading is finished), it automatically opens the panel. The user doesn't have to click anything.

---

## 13. Patterns Worth Remembering

### Discriminated Union for UI State

Instead of multiple booleans (`isDeleteOpen`, `isCreateFolderOpen`), use a typed union:
```typescript
type ModalState = null | { kind: 'create-folder'; name: string } | { kind: 'confirm-delete-note' };
```
One variable, clear states, TypeScript narrows the type automatically when you check `kind`.

### Optimistic Updates

Update the UI immediately, await the server, roll back on failure. Keeps the UI feeling snappy without sacrificing data integrity.

### Resource Router Pattern

One file per resource. Each file creates a `Router`, registers its handlers, exports the router. The main file just mounts them. Easy to find, easy to add, easy to delete.

### `$state` in `.svelte.ts`

Svelte 5's runes work in any file that ends in `.svelte.ts`. This gives you reactive state that lives outside components — a proper store pattern without any store boilerplate.

### Mock API Behind the Same Interface

Define one TypeScript interface. Implement it twice — once as HTTP calls (`realApi`), once as in-memory logic (`mockApi`). Toggle with an env variable. The rest of the codebase never knows which is active. This is the **adapter pattern**.

### CSS Variable Tokens

All design decisions (colors, radii, spacing) live in `:root` as custom properties. Your component CSS uses `var(--accent)`, never raw values. Change the design in one place, everything updates.

### The `flex: 1; min-width: 0` Combo

Any flex item that needs to fill available space AND be able to shrink below its content needs both. `flex: 1` handles the growing, `min-width: 0` overrides the browser's default that prevents shrinking below content size.
