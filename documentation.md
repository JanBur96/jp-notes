# jp-notes

My personal notes app. A Svelte 5 + Express + SQLite project I built from
scratch, partly because I wanted something I actually owned end-to-end, and
partly to finally learn Svelte.

It runs on my own box. Notes live in a local SQLite file. A self-hosted
Ollama model handles summarisation. No cloud, no accounts. Two node processes and a database file.

---

## Running it

Two processes, each with their own package:

```
backend/   node + express + prisma, port 4000
frontend/  vite + svelte 5, port 5173
```

From the repo root:

```bash
# First time
cd backend  && npm i && npx prisma migrate dev
cd frontend && npm i

# Day to day
cd backend  && npm run dev   # http://localhost:4000
cd frontend && npm run dev   # http://localhost:5173
```

Vite proxies `/api/*` to the backend so there is no CORS drama in dev.

If you just want to poke at the UI without running the backend, there is
a mock API that persists to `localStorage`:

```bash
cd frontend && npm run demo
```

That is the same mode the deployed demo on GitHub Pages uses.

### Summarisation

Summarisation talks to a local [Ollama](https://ollama.com) instance on
`localhost:11434`. You need to have the model pulled:

```bash
ollama pull llama3.1:8b
```

If Ollama is not running the summarise button will surface an error; the
rest of the app does not care.

---

## Project shape

```
backend/                         express api + prisma
  src/
    index.ts                     app bootstrap, error middleware
    db.ts                        prisma client singleton
    routes/
      notes.ts
      folders.ts
      tags.ts                    (schema has it, UI does not use it yet)
      ai.ts                      POST /ai/summarize/:noteId → Ollama
  prisma/
    schema.prisma                Note, Folder, Tag models

frontend/
  src/
    main.ts                      mount App
    App.svelte                   shell — composes toolbar/panes/status bar
    app.css                      css variables, scrollbars, global .toolbar-btn
    lib/
      api.ts                     HTTP client + shared TS types
      api.mock.ts                offline localStorage mock (same interface)
      store.svelte.ts            the one store, plus action functions
      folderUtils.ts             isDescendant helper (used by store + tree)
      hotkeys.ts                 matchHotkey(e, {code, ctrl, alt, ...})

      Modal.svelte               generic wrapper
      CreateFolderModal.svelte
      ConfirmDeleteNoteModal.svelte

      Toolbar.svelte             top bar
      ToolbarSearch.svelte       debounced search + dropdown, owns its state
      StatusBar.svelte           bottom bar, pure derived
      ErrorBanner.svelte

      Sidebar.svelte             left pane, folder tree + All Notes + Archive
      FolderTree.svelte          recursive, self-import
      NoteList.svelte            middle pane

      NoteEditor.svelte          right pane — composes the editor pieces
      EditorHeader.svelte        title input + meta + action buttons
      CodeMirrorEditor.svelte    wraps the CM6 view lifecycle
      MarkdownView.svelte        {@html} + markdown typography
      PreviewOverlay.svelte      fullscreen preview on narrow screens
      AiSummaryBar.svelte        summary dock above the status bar
```

---

## Architecture, such as it is

Three boxes:

1. **Svelte UI** in the browser
2. **Express API** over HTTP
3. **SQLite** on disk via Prisma

No auth, no multi-user, no sockets. Data moves in exactly one direction at
a time via REST. Boring on purpose — I can reason about each layer in
isolation.

### The one global store

All app state lives in `lib/store.svelte.ts` as a single `$state` object.
Every component reads and writes it directly. I thought about splitting it
into modules (notes / folders / ui) but the total surface area is small
enough that a single file is actually easier to navigate than three files
that import each other.

The pattern I keep coming back to is **optimistic update + rollback**:

```ts
export async function saveNote(id, data) {
  const list = store.archiveMode ? store.archivedNotes : store.notes;
  const idx = list.findIndex((n) => n.id === id);
  const prev = idx !== -1 ? { ...list[idx] } : null;

  try {
    if (idx !== -1) Object.assign(list[idx], data);   // UI updates now
    await api.notes.update(id, data);                  // network later
    return true;
  } catch (error) {
    if (prev && idx !== -1) Object.assign(list[idx], prev);  // rollback
    store.hasError = 'Failed to save note';
    return false;
  }
}
```

Every mutation does this. Snapshot, mutate, await the server, revert on
failure. The UI feels instant and the server is the source of truth.

### Components are dumb

After the refactor, most components are presentational. They read what
they need from the store, emit events, and do not hold business logic of
their own. The exceptions are:

- `NoteEditor.svelte` owns the unsaved `title` / `content` buffer, because
  the save semantics (flush on navigation, autosave indicator, Ctrl+S) are
  coupled to local editing state.
- `ToolbarSearch.svelte` owns its debounce and the results dropdown,
  because nothing outside it cares about those.
- `AiSummaryBar.svelte` owns the collapsed/expanded flag.

Everything else (`StatusBar`, `ErrorBanner`, the modals, `EditorHeader`,
`MarkdownView`, `PreviewOverlay`) is a pure view onto the store or props.

### Why an adapter API

`lib/api.ts` defines a `realApi` that hits `/api/*` and `lib/api.mock.ts`
implements the same interface against `localStorage`. The export at the
bottom of `api.ts` picks one based on `import.meta.env.VITE_DEMO`:

```ts
export const api = import.meta.env.VITE_DEMO === 'true' ? mockApi : realApi;
```

Two things I got for free:

1. I can ship the UI as a static site on GitHub Pages, no backend required.
   Useful for portfolio purposes.
2. The mock can be used as an offline debugger when the backend is broken.

---

## Backend notes

Nothing exotic. Routes follow the resource-router pattern: one file per
resource, all exporting an Express `Router`. `src/index.ts` mounts them
and registers a global 4-arg error handler so any `next(error)` in any
route lands in the same place.

Prisma is wired up through the LibSQL adapter pointing at a local file:

```ts
const adapter = new PrismaLibSql({ url: 'file:./jp-notes.db' });
const prisma = new PrismaClient({ adapter });
```

Conventions:

- IDs are CUIDs, not integers. URL-safe and sortable.
- Folders are a self-relation. A folder with `parentId = null` is a root
  folder. The UI tree is built client-side by filtering the flat array at
  each recursion level.
- "Delete" sets `archived = true`. Deleting an already-archived note
  actually removes the row. Same pattern Gmail uses and it has saved me
  more than once.
- `PUT /api/notes/:id` accepts `folderId` directly. `PUT /api/folders/:id`
  accepts `parentId` (with an explicit `in` check so `null` actually sets
  it to root — the previous version silently ignored null, which was a
  real bug).

### The AI route

`POST /api/ai/summarize/:noteId` loads the note, shells out to Ollama on
`localhost:11434`, and returns the summary. The backend is the only thing
that knows Ollama exists. If I ever want to swap in a different provider
I change one file.

---

## Frontend gotchas I hit

### `min-width: 0` on flex items

Flex items default to `min-width: auto`, meaning they refuse to shrink
below their content size. This broke the editor pane the first time I
opened the split preview — CodeMirror held its full width and shoved the
preview out of view. The fix is `min-width: 0` on any flex item that
needs to shrink below its children. Same story vertically with
`min-height: 0`.

### `preventDefault()` in `ondragover`

If you forget this the `drop` event never fires. I burnt 20 minutes on
this the first time. Every drop target in `FolderTree.svelte` now guards
against it via `canAcceptDrop()` + `preventDefault()`.

You also cannot read `dataTransfer.getData()` in `dragover` — only in
`drop`. This is why I stash the dragged item in the store as
`draggingItem`, so the drop target can know whether to accept during
hover. If I relied on `dataTransfer` alone I would not be able to
highlight targets correctly.

### Self-importing components

`FolderTree.svelte` renders itself recursively by aliasing its own
import:

```svelte
<script lang="ts">
  import Self from './FolderTree.svelte';
</script>

<!-- later -->
<Self {folders} parentId={folder.id} {...} />
```

Standard Svelte pattern for trees. Every prop has to be threaded through
the recursion, which is why adding `onDropFolder` touched more lines than
I expected.

### Ctrl+N is off-limits

The browser eats it before your handler runs. I moved every global
shortcut to Ctrl+Alt+Letter for that reason. The editor-only ones
(Ctrl+S, Ctrl+F) are safe because the browser's own behaviour there is
either something we want to replace (Save) or something CodeMirror handles
for us (Find).

Shortcuts also use `e.code === 'KeyN'` not `e.key === 'n'`. On a German
keyboard Alt+N produces `˜`, which makes the `e.key` check silently fail.
`e.code` is position-based and layout-independent.

### CodeMirror lifecycle

The view needs to be destroyed and recreated every time you switch notes,
otherwise you end up editing the wrong document. The lifecycle lives in
`CodeMirrorEditor.svelte` inside a `$effect` that depends on `noteId`. A
second `$effect` handles the final cleanup on component unmount.

The parent does not push content updates back into CodeMirror after
construction — only the other direction (CodeMirror → Svelte via
`updateListener`). Trying to make it bidirectional is a recipe for infinite
loops. Seed once on mount, listen for changes, do not fight the editor.

---

## Keyboard shortcuts

| Key              | What it does                          |
|------------------|----------------------------------------|
| Ctrl+Alt+N       | New note in the current folder         |
| Ctrl+Alt+F       | New folder                             |
| Ctrl+Alt+K       | Focus the search box                   |
| Ctrl+Alt+P       | Toggle preview                         |
| Ctrl+S           | Force save the current note            |
| Ctrl+F           | Find in note (handled by CodeMirror)   |
| Esc              | Close modal / search / preview (chain) |

The `matchHotkey` helper in `lib/hotkeys.ts` is how every one of those is
matched. It compares `e.code` and the modifier booleans against a
descriptor object, which keeps the handlers readable:

```ts
if (matchHotkey(e, { code: 'KeyN', ctrl: true, alt: true })) {
  e.preventDefault();
  newNote();
}
```

---

## What I would do next

Not a roadmap, just a brain-dump so I do not forget:

- Export all notes as .md files. Non-negotiable before I trust this with
  my real notes.
- Nightly SQLite backup on a cron.
- Wikilinks. `[[note title]]` autocomplete + click-to-navigate.
- Zod validation on the backend routes.
- Tag UI (the schema already has tags).
- Command palette behind Ctrl+Alt+K instead of just focusing search.

---

## Things I am not going to do

- Add authentication. It runs on localhost. I am the only user. Adding
  auth here would be theatre.
- Introduce a framework like SvelteKit. Vite + `mount(App)` is under ten
  lines and I never want anything more.
- Turn the store into a Redux-style reducer. The `$state` object is the
  right size for a single-user app.
- Ship real-time sync. Notes are not a collaboration problem for me.
