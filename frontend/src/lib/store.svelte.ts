import type { Note, Folder } from './api';
import { api } from './api';

export const store = $state({
  notes: [] as Note[],
  folders: [] as Folder[],
  activeNoteId: null as string | null,
  activeFolderId: null as string | null,
  searchQuery: '',
  mobilePane: 'sidebar' as 'sidebar' | 'list' | 'editor',
});

export async function loadNotes(folderId?: string | null) {
  store.notes = await api.notes.list({ folderId });
}

export async function loadFolders() {
  store.folders = await api.folders.list();
}

export async function saveNote(
  id: string,
  data: { title?: string; content?: string }
) {
  const idx = store.notes.findIndex((n) => n.id === id);
  if (idx !== -1) Object.assign(store.notes[idx], data);
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
  });

  // Use the server-assigned note (with its real ID)
  store.notes.push({ ...created, folder: folderToAssign || null });
  store.activeNoteId = created.id;
  store.mobilePane = 'editor';
}

export async function createFolder(name: string, parentId?: string | null) {
  const newFolder = await api.folders.create({
    name,
    parentId: parentId || undefined,
  });
  store.folders.push(newFolder);
  store.activeFolderId = newFolder.id;
}
