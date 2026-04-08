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
    activeNote ? new Date(activeNote.updatedAt).toLocaleString() : null
  );

  const wordCount = $derived.by(() => {
    if (!activeNote) return 0;
    return activeNote.content
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
  });
</script>

<div class="status-bar">
  <span>{activeFolderLabel}</span>
  <span>·</span>
  <span>{noteCount} notes</span>
  <span>·</span>
  <span>Updated: {lastUpdated ?? 'No note selected'}</span>
  <span>·</span>
  <span>Words: {wordCount}</span>
</div>

<style>
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

  @media (max-width: 600px) {
    .status-bar {
      gap: 8px;
      padding: 5px 12px;
    }
  }
</style>
