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

  // Strip markdown syntax for a cleaner preview in the list
  function previewOf(content: string): string {
    const cleaned = content
      .replace(/^#+\s+/gm, '')
      .replace(/[*_`>~\[\]()]/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    return cleaned.slice(0, 120);
  }

  function formatDate(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / 86400000
    );
    if (diffDays === 0) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
</script>

<section class="pane-list">
  <div class="list-header">
    <span class="list-label">Notes</span>
    <span class="list-folder">{activeFolderName}</span>
    <span class="list-count">{displayedNotes.length}</span>
  </div>

  {#if displayedNotes.length === 0}
    <div class="list-empty">
      <span class="list-empty-line"></span>
      <p>No notes yet</p>
    </div>
  {/if}

  <ul class="note-list">
    {#each displayedNotes as note (note.id)}
      <li
        class="note-item"
        class:active={note.id === store.activeNoteId}
        class:dragging={store.draggingItem?.kind === 'note' &&
          store.draggingItem.id === note.id}
        draggable={!store.archiveMode}
        ondragstart={(e) => {
          if (store.archiveMode) {
            e.preventDefault();
            return;
          }
          store.draggingItem = { kind: 'note', id: note.id };
          e.dataTransfer?.setData('text/plain', note.id);
          if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
        }}
        ondragend={() => {
          store.draggingItem = null;
        }}
      >
        <button
          type="button"
          class="note-item-btn"
          onclick={() => {
            store.activeNoteId = note.id;
            store.mobilePane = 'editor';
          }}
        >
          <div class="note-title">{note.title || 'Untitled'}</div>
          {#if note.content.trim()}
            <div class="note-preview">{previewOf(note.content)}</div>
          {/if}
          <div class="note-meta">
            <span class="note-date">{formatDate(note.updatedAt)}</span>
          </div>
        </button>
      </li>
    {/each}
  </ul>
</section>

<style>
  .pane-list {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    width: 280px;
    min-width: 160px;
    overflow-y: auto;
    padding: 22px 0 16px;
    border-right: 1px solid var(--border);
    background:
      linear-gradient(180deg, rgba(12, 20, 36, 0.55), rgba(6, 12, 24, 0.4));
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  .list-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 0 22px 16px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 8px;
  }

  .list-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .list-folder {
    flex: 1;
    overflow: hidden;
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: -0.01em;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text);
  }

  .list-count {
    padding: 2px 8px;
    border: 1px solid var(--border-hi);
    border-radius: var(--radius-pill);
    font-size: 10px;
    font-weight: 600;
    color: var(--text-3);
    background: rgba(20, 30, 50, 0.5);
  }

  .list-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 40px 22px;
    color: var(--text-3);
  }

  .list-empty-line {
    width: 24px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--accent) 50%,
      transparent
    );
  }

  .list-empty p {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 13px;
  }

  .note-list {
    list-style: none;
    padding: 0 10px;
  }

  .note-item {
    position: relative;
    margin-bottom: 2px;
    border: 1px solid transparent;
    border-radius: 10px;
    cursor: pointer;
    user-select: none;
    transition:
      background var(--dur) var(--ease),
      border-color var(--dur) var(--ease),
      box-shadow var(--dur) var(--ease),
      transform var(--dur) var(--ease);
  }

  .note-item:hover {
    background: rgba(140, 180, 240, 0.04);
  }

  .note-item.active {
    border-color: rgba(228, 178, 89, 0.28);
    background: linear-gradient(
      135deg,
      rgba(228, 178, 89, 0.12),
      rgba(228, 178, 89, 0.02) 60%
    );
    box-shadow:
      inset 0 1px 0 rgba(255, 220, 150, 0.08),
      0 4px 22px -8px rgba(228, 178, 89, 0.35);
  }

  .note-item.active::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 14px;
    bottom: 14px;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: linear-gradient(180deg, #f1c774, #c89040);
    box-shadow: 0 0 12px rgba(228, 178, 89, 0.6);
  }

  .note-item.dragging {
    opacity: 0.5;
  }

  /* button needs explicit flex-column or the preview line escapes the card */
  .note-item-btn {
    all: unset;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    max-width: 100%;
    padding: 12px 14px 11px;
    overflow: hidden;
    cursor: pointer;
  }

  .note-title {
    display: block;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.01em;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text);
  }

  .note-preview {
    display: block;
    min-width: 0;
    max-width: 100%;
    margin-top: 4px;
    overflow: hidden;
    font-size: 11.5px;
    line-height: 1.5;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-2);
  }

  .note-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    max-width: 100%;
    margin-top: 6px;
  }

  .note-date {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .note-item.active .note-date {
    color: var(--accent);
  }

  @media (max-width: 860px) {
    .pane-list {
      width: 250px;
      min-width: 250px;
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
