<script lang="ts">
  import {
    loadNotes,
    loadFolders,
    createNote,
    store,
  } from './lib/store.svelte';
  import { matchHotkey } from './lib/hotkeys';

  import Sidebar from './lib/Sidebar.svelte';
  import NoteList from './lib/NoteList.svelte';
  import NoteEditor from './lib/NoteEditor.svelte';
  import Toolbar from './lib/Toolbar.svelte';
  import StatusBar from './lib/StatusBar.svelte';
  import ErrorBanner from './lib/ErrorBanner.svelte';
  import CreateFolderModal from './lib/CreateFolderModal.svelte';
  import ConfirmDeleteNoteModal from './lib/ConfirmDeleteNoteModal.svelte';
  import HelpModal from './lib/HelpModal.svelte';
  import PwaUpdateToast from './lib/PwaUpdateToast.svelte';

  loadNotes();
  loadFolders();

  let toolbarRef: Toolbar;

  const mobileQuery =
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 600px)')
      : null;
  let isMobile = $state(mobileQuery?.matches ?? false);
  mobileQuery?.addEventListener('change', (e) => (isMobile = e.matches));

  $effect(() => {
    const note =
      store.notes.find((n) => n.id === store.activeNoteId) ??
      store.archivedNotes.find((n) => n.id === store.activeNoteId) ??
      null;
    if (!note) {
      document.title = 'JPNotes';
      return;
    }
    const noteTitle = note.title.trim() || 'Untitled';
    document.title = note.folder
      ? `${note.folder.name} / ${noteTitle} — JPNotes`
      : `${noteTitle} — JPNotes`;
  });

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
    } else if (matchHotkey(e, { code: 'Digit1', ctrl: true, alt: true })) {
      e.preventDefault();
      store.showFolderTree = !store.showFolderTree;
    } else if (matchHotkey(e, { code: 'Digit2', ctrl: true, alt: true })) {
      e.preventDefault();
      store.showNoteList = !store.showNoteList;
    } else if (matchHotkey(e, { code: 'Slash', ctrl: true, alt: true })) {
      e.preventDefault();
      store.modal = store.modal?.kind === 'help' ? null : { kind: 'help' };
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="app">
  <div class="app__ambient" aria-hidden="true"></div>

  <CreateFolderModal />
  <ConfirmDeleteNoteModal />
  <HelpModal />

  <Toolbar
    bind:this={toolbarRef}
    onNewNote={newNote}
    onNewFolder={newFolder}
    onBack={goBack}
  />

  <ErrorBanner />

  <div class={['app__body', `app__body--pane-${store.mobilePane}`]}>
    {#if isMobile || store.showFolderTree}
      <Sidebar />
    {/if}
    {#if isMobile || store.showNoteList}
      <NoteList />
    {/if}
    <NoteEditor />
  </div>

  <StatusBar />

  <PwaUpdateToast />
</div>

<style>
  .app {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100vh;
    isolation: isolate;
  }

  .app__ambient {
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background: radial-gradient(
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

  .app__body {
    position: relative;
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  @media (max-width: 860px) {
    .app__body--pane-editor :global(.sidebar) {
      display: none;
    }
  }

  @media (max-width: 600px) {
    .app__body--pane-sidebar :global(.note-list),
    .app__body--pane-sidebar :global(.note-editor) {
      display: none;
    }
    .app__body--pane-list :global(.sidebar),
    .app__body--pane-list :global(.note-editor) {
      display: none;
    }
    .app__body--pane-editor :global(.sidebar),
    .app__body--pane-editor :global(.note-list) {
      display: none;
    }
  }
</style>
