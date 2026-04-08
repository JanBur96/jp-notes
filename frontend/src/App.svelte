<script lang="ts">
  import { loadNotes, loadFolders, createNote, store } from './lib/store.svelte';
  import { matchHotkey } from './lib/hotkeys';

  import Sidebar from './lib/Sidebar.svelte';
  import NoteList from './lib/NoteList.svelte';
  import NoteEditor from './lib/NoteEditor.svelte';
  import Toolbar from './lib/Toolbar.svelte';
  import StatusBar from './lib/StatusBar.svelte';
  import ErrorBanner from './lib/ErrorBanner.svelte';
  import CreateFolderModal from './lib/CreateFolderModal.svelte';
  import ConfirmDeleteNoteModal from './lib/ConfirmDeleteNoteModal.svelte';

  loadNotes();
  loadFolders();

  let toolbarRef: Toolbar;

  function newNote() {
    createNote(store.activeFolderId ?? undefined);
  }

  function newFolder() {
    store.modal = { kind: 'create-folder', name: '' };
  }

  function goBack() {
    if (store.mobilePane === 'editor') store.mobilePane = 'list';
    else if (store.mobilePane === 'list') store.mobilePane = 'sidebar';
  }

  // Global keyboard shortcuts. We use Ctrl+Alt for actions the browser would
  // otherwise swallow (Ctrl+N opens a new window, Ctrl+F hits the browser
  // find bar). Escape is a chain: close modal first, then search.
  function onKeydown(e: KeyboardEvent) {
    if (matchHotkey(e, { code: 'KeyN', ctrl: true, alt: true })) {
      e.preventDefault();
      newNote();
    } else if (matchHotkey(e, { code: 'KeyF', ctrl: true, alt: true })) {
      e.preventDefault();
      newFolder();
    } else if (matchHotkey(e, { code: 'KeyK', ctrl: true, alt: true })) {
      e.preventDefault();
      toolbarRef?.focusSearch();
    } else if (e.key === 'Escape' && store.modal) {
      e.preventDefault();
      store.modal = null;
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="app-shell">
  <div class="ambient-mesh" aria-hidden="true"></div>

  <CreateFolderModal />
  <ConfirmDeleteNoteModal />

  <Toolbar
    bind:this={toolbarRef}
    onNewNote={newNote}
    onNewFolder={newFolder}
    onBack={goBack}
  />

  <ErrorBanner />

  <div class="app-body" data-pane={store.mobilePane}>
    <Sidebar />
    <NoteList />
    <NoteEditor />
  </div>

  <StatusBar />
</div>

<style>
  .app-shell {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100vh;
    isolation: isolate;
  }

  /* Soft gold + violet lights drifting across the shell. They sit below
     every pane (z-index 0) while panels layer above at z-index 1+. */
  .ambient-mesh {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(
        ellipse 60% 40% at 12% 8%,
        rgba(228, 178, 89, 0.14),
        transparent 70%
      ),
      radial-gradient(
        ellipse 50% 35% at 88% 92%,
        rgba(90, 130, 220, 0.09),
        transparent 70%
      ),
      radial-gradient(
        ellipse 40% 30% at 50% 50%,
        rgba(30, 50, 85, 0.3),
        transparent 70%
      );
  }

  .app-body {
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* Tablet: sidebar hides when the editor is the active pane */
  @media (max-width: 860px) {
    .app-body[data-pane='editor'] :global(.pane-sidebar) {
      display: none;
    }
  }

  /* Phone: the three panes stack, only one visible at a time */
  @media (max-width: 600px) {
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
  }
</style>
