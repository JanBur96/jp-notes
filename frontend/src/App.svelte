<script lang="ts">
  import Sidebar from './lib/Sidebar.svelte';
  import NoteList from './lib/NoteList.svelte';
  import NoteEditor from './lib/NoteEditor.svelte';
  import {
    loadNotes,
    createNote,
    store,
    loadFolders,
    createFolder,
    deleteNote,
    loadArchivedNotes,
  } from './lib/store.svelte';
  import Modal from './lib/Modal.svelte';

  loadNotes();
  loadFolders();
  loadArchivedNotes();

  const newNote = (folderId?: string | null) => {
    createNote(folderId ?? undefined);
  };

  const newFolder = () => {
    store.modal = { kind: 'create-folder', name: '' };
  };

  const goBack = () => {
    if (store.mobilePane === 'editor') store.mobilePane = 'list';
    else if (store.mobilePane === 'list') store.mobilePane = 'sidebar';
  };

  const disableError = () => {
    store.hasError = '';
  };

  function handleCreateFolder() {
    if (store.modal?.kind !== 'create-folder') return;
    if (!store.modal.name.trim()) return;

    createFolder(store.modal.name.trim(), store.activeFolderId ?? undefined);

    store.modal = null;
  }

  function handleDeleteNote() {
    if (store.modal?.kind !== 'confirm-delete-note') return;
    if (!store.activeNoteId) return;

    deleteNote(store.activeNoteId);

    store.modal = null;
  }
</script>

<div class="app-shell">
  {#if store.modal?.kind === 'create-folder'}
    <Modal title="Create Folder">
      <label class="modal-field">
        <input
          bind:value={store.modal.name}
          class="modal-input"
          placeholder="Folder name"
        />
      </label>
      <button
        class="modal-button toolbar-btn primary"
        onclick={handleCreateFolder}>Create</button
      >
    </Modal>
  {/if}
  {#if store.modal?.kind === 'confirm-delete-note'}
    <Modal title="Delete Note">
      <p>Are you sure you want to delete this note?</p>
      <button
        class="modal-button toolbar-btn primary"
        onclick={handleDeleteNote}>Delete</button
      >
      <button
        class="modal-button toolbar-btn"
        onclick={() => {
          store.modal = null;
        }}>Cancel</button
      >
    </Modal>
  {/if}
  <div class="toolbar">
    <button
      class="toolbar-btn mobile-back"
      class:hidden={store.mobilePane === 'sidebar'}
      onclick={goBack}
      aria-label="Back">←</button
    >
    <span class="toolbar-title">JP<em>Notes</em></span>
    <button
      class="toolbar-btn primary"
      onclick={() => newNote(store.activeFolderId)}>New Note</button
    >
    <button class="toolbar-btn" onclick={newFolder}>New Folder</button>
  </div>
  {#if store.hasError}
    <div class="toolbar-error">
      <span class="error-message">{store.hasError}</span>
      <button class="toolbar-btn toolbar-btn--error" onclick={disableError}
        >Dismiss</button
      >
    </div>
  {/if}

  <div class="app-body" data-pane={store.mobilePane}>
    <Sidebar />
    <NoteList />
    <NoteEditor />
  </div>

  <div class="status-bar">
    <span
      >{store.archiveMode
        ? 'Archive'
        : (store.folders.find((f) => f.id === store.activeFolderId)?.name ??
          'All Notes')}</span
    >
    <span>·</span>
    <span
      >{(store.archiveMode ? store.archivedNotes : store.notes).length} notes</span
    >
  </div>
</div>
