<script lang="ts">
  import Sidebar from './lib/Sidebar.svelte';
  import NoteList from './lib/NoteList.svelte';
  import NoteEditor from './lib/NoteEditor.svelte';
  import {
    loadNotes,
    createNote,
    store,
    loadFolders,
  } from './lib/store.svelte';

  loadNotes();
  loadFolders();
  const newNote = (folderId?: string | null) => {
    console.log(store.activeFolderId);
    createNote(folderId ?? undefined);
  };
</script>

<div class="app-shell">
  <div class="toolbar">
    <span class="toolbar-title">JP<span>Notes</span></span>
    <button
      class="toolbar-btn primary"
      onclick={() => newNote(store.activeFolderId)}>New Note</button
    >
    <button class="toolbar-btn">New Folder</button>
  </div>

  <div class="app-body">
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
