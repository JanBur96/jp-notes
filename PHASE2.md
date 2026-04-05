# Phase 2 — JP Notes

## Must Do

### Bug fixes / real issues

- **Error handling** — every store function (`saveNote`, `createNote`, etc.) is async but nothing catches errors. Add try/catch and surface failures to the UI (a toast or inline error message).

- **Status bar** — currently hardcoded fake data. Wire up real values: active folder name, note count in current view, last edited timestamp of the active note.

- **NoteList folder name** — `api.folders.get()` is called on every folder switch even though the data already lives in `store.folders`. Replace the effect + local state with a `$derived`.

- **Folder creation input** — `window.prompt()` is a blocking browser dialog. Replace with an inline input that appears in the sidebar, or a small modal.

### Planned features (stubs already in codebase)

- **Tags** — interfaces and backend endpoints are ready. Add tag creation, display on note items and in the editor, and filtering by tag in the sidebar. The `// Phase 2` markers in `api.ts` and `store.svelte.ts` show exactly where to plug in.

- **Archive** — sidebar item already exists as a placeholder. Implement soft-delete: move notes to an archived state instead of deleting them permanently.

- **Delete confirmation** — the delete button currently destroys a note immediately. Add a confirmation step (inline "Are you sure?" or a small dialog). TODO comment already in `NoteEditor.svelte`.

---

## Might Do

- **Auto-save** — debounce saves on content/title change (e.g. 1.5s after the user stops typing) instead of requiring a manual Save click. Show a subtle "Saved" indicator.

- **Note pinning** — the `pinned` field already exists on the `Note` interface and in the API. Surface it as a pin button in the editor header and sort pinned notes to the top of the list.

- **Move note to folder** — a dropdown or drag target in the editor to reassign a note's folder without deleting and recreating it.

- **Search** — the `search` param is already defined in `api.notes.list`. Add a search input to the toolbar that filters notes live.

- **Optimistic update rollback** — `saveNote` updates the store before the API responds. If the request fails, the UI shows stale data. Store the previous value and restore it on error.

- **Note preview in list** — show the first line of content below the title in `NoteList`. The `note-preview` CSS class was removed as unused but can come back once wired up.

---

## Nice Ideas

- **Keyboard shortcuts** — `Ctrl+S` to save, `Ctrl+P` to toggle preview, `Escape` already closes preview. Add a shortcuts reference somewhere in the UI.

- **Word / character count** — show in the status bar while a note is open. Cheap to implement, useful for writing.

- **Note count per folder** — small badge next to each folder name in the sidebar showing how many notes it contains.

- **Export as Markdown** — a button in the editor that downloads the current note as a `.md` file. One `Blob` + `URL.createObjectURL` call.

- **Drag-and-drop to move notes** — drag a note from the list onto a folder in the sidebar to reassign it.

- **Collapsible sidebar** — a toggle to hide the sidebar entirely and give more space to the note list and editor on medium screens.

- **Theme toggle** — the CSS variables are already centralized in `:root`, so switching to a light theme is mostly just overriding those values.
