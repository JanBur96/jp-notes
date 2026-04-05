import type { Note, Folder } from './api'; // Phase 2: import Tag
import { api } from './api';

export const store = $state({
  notes: [] as Note[],
  folders: [] as Folder[],
  // Phase 2: tags: [] as Tag[],
  activeNoteId: null as string | null,
  activeFolderId: null as string | null,
  searchQuery: '',
});

export async function loadNotes(folderId?: string | null) {
  store.notes = await api.notes.list({ folderId });
}

export async function loadFolders() {
  store.folders = await api.folders.list();
}

// Phase 2: export async function loadTags() {
//   store.tags = await api.tags.list();
// }

export async function saveNote(
  id: string,
  data: { title?: string; content?: string /* Phase 2: tags?: string[] */ }
) {
  const idx = store.notes.findIndex((n) => n.id === id);
  if (idx !== -1) Object.assign(store.notes[idx], data);
  console.log(id, data);

  await api.notes.update(id, data);
}

export async function deleteNote(id: string) {
  store.notes = store.notes.filter((n) => n.id !== id);
  await api.notes.delete(id);
}

export async function createNote(folderId?: string) {
  const folderToAssign = folderId
    ? store.folders.find((f) => f.id === folderId)
    : null;

  const created = await api.notes.create({
    title: '',
    content: '',
    folderId: folderToAssign?.id || undefined,
    // Phase 2: tags
  });

  // Use the server-assigned note (with its real ID)
  store.notes.push({ ...created, folder: folderToAssign || null });
  store.activeNoteId = created.id;
}
