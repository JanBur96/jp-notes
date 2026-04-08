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
  } from './lib/store.svelte';
  import { api, type Note } from './lib/api';
  import Modal from './lib/Modal.svelte';

  loadNotes();
  loadFolders();

  let searchQuery = $state('');
  let searchResults = $state<Note[]>([]);
  let searchOpen = $state(false);
  let selectedIndex = $state(0);

  $effect(() => {
    const q = searchQuery.trim();
    if (q === '') {
      searchResults = [];
      searchOpen = false;
      return;
    }

    const handle = window.setTimeout(async () => {
      try {
        const results = await api.notes.list({ search: q });
        searchResults = results.slice(0, 8);
        selectedIndex = 0;
        searchOpen = true;
      } catch (e) {
        console.error('Search failed:', e);
      }
    }, 200);

    return () => clearTimeout(handle);
  });

  function selectSearchResult(note: Note) {
    if (!store.notes.find((n) => n.id === note.id)) {
      store.notes = [...store.notes, note];
    }
    if (store.activeFolderId !== note.folderId) {
      store.activeFolderId = note.folderId;
    }
    if (store.archiveMode) store.archiveMode = false;
    store.activeNoteId = note.id;
    store.mobilePane = 'editor';
    closeSearch();
  }

  function closeSearch() {
    searchQuery = '';
    searchResults = [];
    searchOpen = false;
    selectedIndex = 0;
  }

  function onSearchKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
      return;
    }
    if (!searchOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % searchResults.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex =
        (selectedIndex - 1 + searchResults.length) % searchResults.length;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const note = searchResults[selectedIndex];
      if (note) selectSearchResult(note);
    }
  }

  function onWindowClick(e: MouseEvent) {
    const target = e.target as HTMLElement | null;
    if (!target?.closest?.('.toolbar-search')) {
      searchOpen = false;
    }
  }

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

  function getLastUpdatedAt() {
    const notes = store.archiveMode ? store.archivedNotes : store.notes;
    const activeNote = notes.find((n) => n.id === store.activeNoteId);
    return activeNote ? new Date(activeNote.updatedAt).toLocaleString() : null;
  }

  function getWordCount() {
    const notes = store.archiveMode ? store.archivedNotes : store.notes;
    const activeNote = notes.find((n) => n.id === store.activeNoteId);
    if (!activeNote) return 0;
    return activeNote.content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  function activateHotKeys(e: KeyboardEvent) {
    if (e.code === 'KeyN' && e.altKey && e.ctrlKey) {
      e.preventDefault();
      newNote(store.activeFolderId);
    } else if (e.code === 'KeyF' && e.altKey && e.ctrlKey) {
      e.preventDefault();
      newFolder();
    } else if (e.code === 'KeyK' && e.altKey && e.ctrlKey) {
      e.preventDefault();
      const searchInput = document.querySelector(
        '.search-input'
      ) as HTMLInputElement;
      searchInput.focus();
    } else if (e.code === 'Escape') {
      if (store.modal) {
        e.preventDefault();
        store.modal = null;
      } else if (searchOpen) {
        e.preventDefault();
        closeSearch();
      }
    }
  }
</script>

<svelte:window onclick={onWindowClick} onkeydown={activateHotKeys} />

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
    <div class="toolbar-search">
      <input
        type="text"
        class="search-input"
        placeholder="Search notes…"
        bind:value={searchQuery}
        onfocus={() => {
          if (searchResults.length > 0) searchOpen = true;
        }}
        onkeydown={onSearchKeydown}
      />
      {#if searchOpen && searchResults.length > 0}
        <ul class="search-results">
          {#each searchResults as note, i (note.id)}
            <li class:active={i === selectedIndex}>
              <button
                type="button"
                class="search-result-btn"
                onmouseenter={() => (selectedIndex = i)}
                onclick={() => selectSearchResult(note)}
              >
                <span class="search-result-title">
                  {note.title || 'Untitled'}
                </span>
                <span class="search-result-folder">
                  {note.folder?.name ?? 'All Notes'}
                </span>
              </button>
            </li>
          {/each}
        </ul>
      {:else if searchOpen && searchQuery.trim() !== ''}
        <ul class="search-results">
          <li class="search-empty">No matches</li>
        </ul>
      {/if}
    </div>
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
    <span>·</span>
    <span>Updated: {getLastUpdatedAt() ?? 'No Note Selected'}</span>
    <span>·</span>
    <span>Words: {getWordCount() ?? 0}</span>
  </div>
</div>

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg);
  }

  .toolbar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 6px;
    height: 44px;
    padding: 0 20px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }

  .toolbar-title {
    margin-right: 16px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  .toolbar-search {
    position: relative;
    flex: 1;
    max-width: 360px;
    margin-right: auto;
  }

  .search-input {
    width: 100%;
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: 20px;
    outline: none;
    background: var(--surface-2);
    font-family: inherit;
    font-size: 12px;
    color: var(--text);
    transition:
      border-color 0.12s,
      background 0.12s;
  }

  .search-input::placeholder {
    color: var(--text-3);
  }

  .search-input:focus {
    border-color: rgba(192, 144, 48, 0.32);
    background: var(--surface-3);
  }

  .search-results {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 60;
    max-height: 360px;
    overflow-y: auto;
    list-style: none;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-2);
    box-shadow:
      0 18px 48px rgba(0, 0, 0, 0.55),
      0 4px 12px rgba(0, 0, 0, 0.35);
  }

  .search-result-btn {
    all: unset;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 9px 14px;
    cursor: pointer;
  }

  .search-results li.active .search-result-btn {
    background: var(--accent-dim);
  }

  .search-result-title {
    overflow: hidden;
    font-size: 13px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text);
  }

  .search-result-folder {
    font-size: 11px;
    color: var(--text-3);
  }

  .search-empty {
    padding: 12px 14px;
    font-size: 12px;
    font-style: italic;
    color: var(--text-3);
  }

  .toolbar-title em {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-weight: 500;
    letter-spacing: 0;
    color: var(--accent);
  }

  .toolbar-error {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 6px;
    padding: 10px 14px;
    border: 1px solid rgba(200, 60, 60, 0.22);
    border-radius: var(--radius);
    background: rgba(200, 60, 60, 0.07);
    font-size: 13px;
  }

  .app-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .status-bar {
    display: flex;
    flex-shrink: 0;
    gap: 16px;
    padding: 6px 20px;
    border-top: 1px solid var(--border);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .mobile-back {
    display: none;
    margin-right: 4px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 16px;
  }

  .mobile-back.hidden {
    visibility: hidden;
    pointer-events: none;
  }

  .modal-button {
    margin-top: 14px;
  }

  .modal-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .modal-input {
    padding: 9px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    outline: none;
    background: var(--surface-3);
    font-family: inherit;
    font-size: 13px;
    color: var(--text);
    transition: border-color 0.12s;
  }

  .modal-input:focus {
    border-color: rgba(192, 144, 48, 0.35);
  }

  @media (max-width: 860px) {
    .app-body[data-pane='editor'] :global(.pane-sidebar) {
      display: none;
    }
  }

  @media (max-width: 600px) {
    .mobile-back {
      display: block;
    }

    .toolbar {
      gap: 6px;
      padding: 0 12px;
    }

    .toolbar-title {
      flex: 1;
      margin-right: 0;
      text-align: center;
    }

    .toolbar-search {
      display: none;
    }

    .app-body[data-pane='sidebar'] :global(.pane-list),
    .app-body[data-pane='sidebar'] :global(.pane-editor) {
      display: none;
    }

    .app-body[data-pane='list'] :global(.pane-sidebar),
    .app-body[data-pane='list'] :global(.pane-editor) {
      display: none;
    }

    .app-body[data-pane='editor'] :global(.pane-sidebar),
    .app-body[data-pane='editor'] :global(.pane-list) {
      display: none;
    }

    .status-bar {
      gap: 8px;
      padding: 5px 12px;
    }
  }
</style>
