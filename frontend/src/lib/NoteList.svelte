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
            <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
          </div>
        </button>
      </li>
    {/each}
  </ul>
</div>

<style>
  .pane-list {
    flex-shrink: 0;
    width: 240px;
    min-width: 140px;
    overflow-y: auto;
    padding: 16px 0 12px;
    border-right: 1px solid var(--border);
    background: var(--surface);
  }

  .section-label {
    padding: 0 16px 10px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .note-item {
    border-left: 2px solid transparent;
    cursor: pointer;
    user-select: none;
    transition:
      background 0.1s,
      border-color 0.1s;
  }

  .note-item:hover {
    background: rgba(130, 170, 230, 0.05);
  }

  .note-item.active {
    border-left-color: var(--accent);
    background: var(--accent-dim);
  }

  .note-item-btn {
    all: unset;
    display: block;
    width: 100%;
    padding: 10px 16px 10px 14px;
    text-align: left;
    cursor: pointer;
  }

  .note-title {
    overflow: hidden;
    font-size: 13px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text);
  }

  .note-meta {
    margin-top: 3px;
    font-size: 11px;
    color: var(--text-3);
  }

  /* ── Responsive ────────────────────────────────────────── */

  @media (max-width: 860px) {
    .pane-list {
      width: 220px;
      min-width: 220px;
    }
  }

  @media (max-width: 600px) {
    .pane-list {
      width: 100%;
      min-width: 0;
      border-right: none;
    }
  }
</style>
