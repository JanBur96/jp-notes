import type { Note, Folder } from './api';
import { api } from './api';

type ModalState =
  | null
  | { kind: 'create-folder'; name: string }
  | { kind: 'confirm-delete-note' };

type DraggingItem =
  | null
  | { kind: 'note'; id: string }
  | { kind: 'folder'; id: string };

export const store = $state({
  notes: [] as Note[],
  folders: [] as Folder[],
  activeNoteId: null as string | null,
  activeFolderId: null as string | null,
  searchQuery: '',
  mobilePane: 'sidebar' as 'sidebar' | 'list' | 'editor',
  hasError: '',
  modal: null as ModalState,
  archiveMode: false,
  archivedNotes: [] as Note[],
  aiLoading: false,
  aiSummary: '' as string,
  draggingItem: null as DraggingItem,
});

function isDescendant(
  folders: Folder[],
  ancestorId: string,
  candidateId: string
): boolean {
  let current = folders.find((f) => f.id === candidateId);
  while (current?.parentId) {
    if (current.parentId === ancestorId) return true;
    current = folders.find((f) => f.id === current!.parentId);
  }
  return false;
}

export async function moveFolderToParent(
  folderId: string,
  parentId: string | null
) {
  const idx = store.folders.findIndex((f) => f.id === folderId);
  if (idx === -1) return;
  const prev = { ...store.folders[idx] };
  if ((prev.parentId ?? null) === parentId) return;
  if (parentId === folderId) return;
  if (parentId && isDescendant(store.folders, folderId, parentId)) {
    store.hasError = 'Cannot move folder into its own descendant';
    return;
  }

  store.folders[idx].parentId = parentId;

  try {
    await api.folders.update(folderId, { parentId });
  } catch (error) {
    console.error('Failed to move folder:', error);
    Object.assign(store.folders[idx], prev);
    store.hasError = 'Failed to move folder';
  }
}

export async function moveNoteToFolder(
  noteId: string,
  folderId: string | null
) {
  const idx = store.notes.findIndex((n) => n.id === noteId);
  if (idx === -1) return;
  const prev = { ...store.notes[idx] };
  if ((prev.folderId ?? null) === folderId) return;

  const targetFolder = folderId
    ? (store.folders.find((f) => f.id === folderId) ?? null)
    : null;

  store.notes[idx].folderId = folderId;
  store.notes[idx].folder = targetFolder;

  if (store.activeFolderId !== null && store.activeFolderId !== folderId) {
    store.notes = store.notes.filter((n) => n.id !== noteId);
  }

  try {
    await api.notes.update(noteId, { folderId });
  } catch (error) {
    console.error('Failed to move note:', error);
    const stillThere = store.notes.findIndex((n) => n.id === noteId);
    if (stillThere === -1) store.notes.push(prev);
    else Object.assign(store.notes[stillThere], prev);
    store.hasError = 'Failed to move note';
  }
}

export async function loadNotes(folderId?: string | null) {
  const expected = folderId ?? null;
  try {
    const notes = await api.notes.list({ folderId });
    if (store.activeFolderId === expected && !store.archiveMode) {
      store.notes = notes;
    }
  } catch (error) {
    console.error('Failed to load notes:', error);
    store.hasError = 'Failed to load notes';
  }
}

export async function loadFolders() {
  try {
    store.folders = await api.folders.list();
  } catch (error) {
    console.error('Failed to load folders:', error);
    store.hasError = 'Failed to load folders';
  }
}

export async function loadArchivedNotes() {
  try {
    const notes = await api.notes.list({ archived: true });
    if (store.archiveMode) {
      store.archivedNotes = notes;
    }
  } catch (error) {
    console.error('Failed to load archived notes:', error);
    store.hasError = 'Failed to load archived notes';
  }
}

export async function saveNote(
  id: string,
  data: { title?: string; content?: string }
): Promise<boolean> {
  const idx = store.archiveMode
    ? store.archivedNotes.findIndex((n) => n.id === id)
    : store.notes.findIndex((n) => n.id === id);

  const prev = store.archiveMode
    ? idx !== -1
      ? { ...store.archivedNotes[idx] }
      : null
    : idx !== -1
      ? { ...store.notes[idx] }
      : null;

  try {
    if (idx !== -1)
      Object.assign(
        store.archiveMode ? store.archivedNotes[idx] : store.notes[idx],
        data
      );
    await api.notes.update(id, data);
    return true;
  } catch (error) {
    console.error('Failed to save note:', error);
    if (prev && idx !== -1)
      Object.assign(
        store.archiveMode ? store.archivedNotes[idx] : store.notes[idx],
        prev
      );
    store.hasError = 'Failed to save note';
    return false;
  }
}

export async function createNote(folderId?: string) {
  try {
    const folder = folderId
      ? store.folders.find((f) => f.id === folderId)
      : null;
    const created = await api.notes.create({
      title: '',
      content: '',
      folderId: folder?.id,
    });
    store.notes.push({ ...created, folder: folder ?? null });
    store.activeNoteId = created.id;
    store.mobilePane = 'editor';
  } catch (error) {
    console.error('Failed to create note:', error);
    store.hasError = 'Failed to create note';
  }
}

export async function archiveNote(id: string) {
  const note = store.notes.find((n) => n.id === id);
  try {
    await api.notes.update(id, { archived: true });
    store.notes = store.notes.filter((n) => n.id !== id);
    if (note) store.archivedNotes.push({ ...note, archived: true });
    store.activeNoteId = null;
  } catch (error) {
    console.error('Failed to archive note:', error);
    store.hasError = 'Failed to archive note';
  }
}

export async function unarchiveNote(id: string) {
  const note = store.archivedNotes.find((n) => n.id === id);
  try {
    await api.notes.update(id, { archived: false });
    store.archivedNotes = store.archivedNotes.filter((n) => n.id !== id);
    if (note) store.notes.push({ ...note, archived: false });
    store.activeNoteId = null;
  } catch (error) {
    console.error('Failed to unarchive note:', error);
    store.hasError = 'Failed to unarchive note';
  }
}

export async function deleteNote(id: string) {
  const note =
    store.notes.find((n) => n.id === id) ??
    store.archivedNotes.find((n) => n.id === id);

  if (note?.archived) {
    try {
      store.archivedNotes = store.archivedNotes.filter((n) => n.id !== id);
      store.activeNoteId = null;
      await api.notes.delete(id);
    } catch (error) {
      console.error('Failed to delete note:', error);
      store.hasError = 'Failed to delete note';
    }
  } else {
    await archiveNote(id);
  }
}

export async function createFolder(name: string, parentId?: string | null) {
  try {
    const newFolder = await api.folders.create({
      name,
      parentId: parentId || undefined,
    });
    store.folders.push(newFolder);
    store.activeFolderId = newFolder.id;
    store.archiveMode = false;
  } catch (error) {
    console.error('Failed to create folder:', error);
    store.hasError = 'Failed to create folder';
  }
}

export function openDeleteNoteModal() {
  store.modal = { kind: 'confirm-delete-note' };
}

export function closeModal() {
  store.modal = null;
}

export function summarizeNote(id: string) {
  store.aiLoading = true;
  api.ai
    .summarize(id)
    .then((res) => {
      store.aiSummary = res.summary;
    })
    .catch((error) => {
      console.error('Failed to summarize note:', error);
      store.hasError = 'Failed to summarize note';
    })
    .finally(() => {
      store.aiLoading = false;
    });
}
