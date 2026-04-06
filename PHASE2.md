# Phase 2 — JP Notes

## Done

- **Error handling** — all store functions have try/catch; errors surface via a dismissable error bar in the toolbar.
- **Folder creation modal** — replaced `window.prompt()` with a proper `Modal` component.
- **Archive** — soft-delete implemented; `archiveNote` / `unarchiveNote` / `loadArchivedNotes` in store; Archive sidebar item works end-to-end.
- **Delete confirmation** — modal-based "Are you sure?" dialog before deleting a note.
- **NoteList folder name** — reads from `store.folders` via `$derived`-style lookup instead of calling `api.folders.get()`.
- **Status bar (basic)** — wired to real values: active folder name and note count.

---

## Must Do

### Remaining bugs / rough edges

- **Status bar archive mode** — in archive mode the status bar still shows "All Notes" because it only checks `store.activeFolderId`. Should show "Archive" and `store.archivedNotes.length`.

- **Status bar last edited** — the original plan included showing the active note's last-edited timestamp. The `updatedAt` field is on the `Note` interface; just needs a third `<span>` in `App.svelte`.

- **Optimistic update rollback** — `saveNote` writes to the store *before* the API responds. On failure the store is updated but the server disagrees. Capture the old values before the write and restore them in the catch block.

- **Search not wired up** — `store.searchQuery` is defined and the `search` param exists in `api.notes.list`, but there is no search input and `loadNotes` never passes the query. Add an input to the toolbar that triggers `loadNotes` on change (debounced).

### Planned features (stubs already in codebase)

- **Tags** — the `Tag` interface, `tags` field on `Note`, and backend endpoints are all ready. Add tag display on note items and in the editor, tag creation, and filtering by tag in the sidebar.

---

## Might Do

- **Auto-save** — debounce saves on content/title change (~1.5 s after typing stops) instead of requiring a manual Save. Show a subtle "Saved ✓" indicator that fades out.

- **Note pinning** — the `pinned` field exists on `Note` and `api.notes.update` accepts it. Add a pin/unpin button in the editor header and sort pinned notes to the top of `NoteList`.

- **Move note to folder** — a dropdown in the editor header to reassign a note's folder. `api.notes.update` already accepts `folderId`.

- **Note preview in list** — show the first line of content below the title in `NoteList`. Trim markdown syntax before displaying.

- **Rename / delete folder** — `api.folders.update` and `api.folders.delete` exist but have no UI. A right-click context menu or inline icon buttons next to each folder in the sidebar would cover both.

- **Show `updatedAt` in editor meta** — the editor meta bar currently shows `createdAt`. Swapping to `updatedAt` (or showing both) is a one-line change and more immediately useful.

---

## Nice Ideas

### Easy wins

- **Keyboard shortcuts** — `Ctrl+S` to save, `Ctrl+P` to toggle preview (`Escape` to close preview already works). Add a small shortcuts tooltip or footer note somewhere in the UI.

- **Word / character count** — live count while a note is open, shown in the status bar. `content.split(/\s+/).filter(Boolean).length` is all it takes.

- **Reading time estimate** — next to word count: `Math.ceil(wordCount / 200) min read`. One line.

- **Note count per folder** — small badge next to each folder name in the sidebar. Can be computed client-side from `store.notes` grouped by `folderId`.

- **Sort notes** — a toggle in the note list header to sort by title A–Z, newest first, or oldest first. Client-side sort on `displayedNotes`.

- **Duplicate note** — a button in the editor that calls `api.notes.create` with the current note's title + content. Cheap and often useful.

- **Export as Markdown** — a button in the editor that downloads the current note as a `.md` file via `Blob` + `URL.createObjectURL`.

### Medium effort

- **Markdown toolbar** — a small row of buttons above the CodeMirror editor (Bold, Italic, Link, Code block) that insert the corresponding syntax at the cursor position using the CodeMirror `dispatch` API.

- **Focus / zen mode** — a toggle that hides the sidebar and note list, leaving only the editor. Full-screen writing. Can be done with a CSS class on `.app-shell`.

- **Import from Markdown file** — a file input that reads a `.md` file and creates a new note from its content.

- **Collapsible sidebar** — a toggle to hide the sidebar entirely and give more room to the note list and editor on medium screens.

### Harder / nice to have

- **Theme toggle** — the CSS variables are already centralized in `:root`, so a light theme is mostly overriding those values. Needs a toggle button and `localStorage` persistence.

- **Drag-and-drop to move notes** — drag a note from the list onto a folder in the sidebar to reassign it. Requires a `dragstart` / `dragover` / `drop` event setup and a `api.notes.update({ folderId })` call.

- **Subfolder creation from context menu** — the data model and `createFolder(name, parentId)` already support nesting. What's missing is a way to target a specific parent folder from the UI when creating.

- **Bulk operations** — checkbox-select multiple notes to delete or move them at once.

- **Note version history** — keep the last N snapshots of a note's content server-side so you can undo a destructive edit.
