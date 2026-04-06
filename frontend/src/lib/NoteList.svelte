<script lang="ts">
  import { loadNotes, loadArchivedNotes, store } from './store.svelte';

  let activeFolderName = $state<string>('');

  $effect(() => {
    const folderId = store.activeFolderId;
    const archiveMode = store.archiveMode;

    if (archiveMode) {
      void loadArchivedNotes();
      activeFolderName = 'Archive';
      return;
    }

    void loadNotes(folderId);

    if (!folderId) {
      activeFolderName = 'All Notes';
      return;
    }

    activeFolderName =
      store.folders.find((f) => f.id === folderId)?.name || 'All Notes';
  });

  const displayedNotes = $derived(
    store.archiveMode ? store.archivedNotes : store.notes
  );
</script>

<div class="pane-list">
  <div class="section-label">
    NOTES {activeFolderName ? `— ${activeFolderName}` : ''}
  </div>
  <ul class="note-list">
    {#each displayedNotes as note (note.id)}
      <li class="note-item" class:active={note.id === store.activeNoteId}>
        <button
          type="button"
          class="note-item-btn"
          onclick={() => {
            store.activeNoteId = note.id;
            store.mobilePane = 'editor';
          }}
        >
          <div class="note-title">{note.title}</div>
          <div class="note-meta">
            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
          </div>
        </button>
      </li>
    {/each}
  </ul>
</div>
