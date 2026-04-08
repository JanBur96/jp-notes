<script lang="ts">
  import { store } from './store.svelte';

  const activeNote = $derived(
    (store.archiveMode ? store.archivedNotes : store.notes).find(
      (n) => n.id === store.activeNoteId
    ) ?? null
  );

  const activeFolderLabel = $derived(
    store.archiveMode
      ? 'Archive'
      : (store.folders.find((f) => f.id === store.activeFolderId)?.name ??
        'All Notes')
  );

  const noteCount = $derived(
    (store.archiveMode ? store.archivedNotes : store.notes).length
  );

  const lastUpdated = $derived(
    activeNote
      ? new Date(activeNote.updatedAt).toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null
  );

  const wordCount = $derived.by(() => {
    if (!activeNote) return 0;
    return activeNote.content
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
  });
</script>

<footer class="status-bar">
  <div class="status-left">
    <span class="status-dot"></span>
    <span class="status-label">{activeFolderLabel}</span>
    <span class="status-sep">·</span>
    <span>{noteCount} notes</span>
  </div>
  <div class="status-right">
    {#if lastUpdated}
      <span>Updated {lastUpdated}</span>
      <span class="status-sep">·</span>
      <span>{wordCount} words</span>
    {:else}
      <span class="status-muted">No note selected</span>
    {/if}
  </div>
</footer>

<style>
  .status-bar {
    position: relative;
    z-index: 2;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: 28px;
    padding: 0 22px;
    border-top: 1px solid var(--border);
    background: rgba(8, 14, 26, 0.55);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .status-left,
  .status-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .status-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #7dd8a0;
    box-shadow: 0 0 8px rgba(125, 216, 160, 0.55);
  }

  .status-label {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0;
    text-transform: none;
    color: var(--text-2);
  }

  .status-sep {
    color: var(--text-4);
  }

  .status-muted {
    font-style: italic;
    text-transform: none;
    font-size: 11px;
    letter-spacing: 0;
  }

  @media (max-width: 600px) {
    .status-bar {
      gap: 10px;
      padding: 0 14px;
    }

    .status-right {
      display: none;
    }
  }
</style>
