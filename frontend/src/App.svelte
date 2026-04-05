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
  } from './lib/store.svelte';

  loadNotes();
  loadFolders();

  const newNote = (folderId?: string | null) => {
    console.log(store.activeFolderId);
    createNote(folderId ?? undefined);
  };

  const newFolder = () => {
    const name = prompt('Folder name');
    if (name) {
      createFolder(name, store.activeFolderId ?? undefined);
    }
  };

  const goBack = () => {
    if (store.mobilePane === 'editor') store.mobilePane = 'list';
    else if (store.mobilePane === 'list') store.mobilePane = 'sidebar';
  };
</script>

<div class="app-shell">
  <div class="toolbar">
    <button
      class="toolbar-btn mobile-back"
      class:hidden={store.mobilePane === 'sidebar'}
      onclick={goBack}
      aria-label="Back">←</button
    >
    <span class="toolbar-title">JP<span>Notes</span></span>
    <button
      class="toolbar-btn primary"
      onclick={() => newNote(store.activeFolderId)}>New Note</button
    >
    <button class="toolbar-btn" onclick={newFolder}>New Folder</button>
  </div>

  <div class="app-body" data-pane={store.mobilePane}>
    <Sidebar />
    <NoteList />
    <NoteEditor />
  </div>

  <div class="status-bar">
    <span>Work / Meetings</span>
    <span>·</span>
    <span>3 notes</span>
    <span>·</span>
    <span>Last edited Jan 15, 2026</span>
  </div>
</div>
