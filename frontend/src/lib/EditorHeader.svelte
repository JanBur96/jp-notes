<script lang="ts">
  import type { Note } from './api';

  interface Props {
    note: Note;
    title: string;
    showPreview: boolean;
    savedRecently: boolean;
    onTitleChange: (value: string) => void;
    onSave: () => void;
    onTogglePreview: () => void;
    onSummarize: () => void;
    onDelete: () => void;
    onUnarchive: () => void;
  }

  const {
    note,
    title,
    showPreview,
    savedRecently,
    onTitleChange,
    onSave,
    onTogglePreview,
    onSummarize,
    onDelete,
    onUnarchive,
  }: Props = $props();
</script>

<div>
  <input
    class="editor-title"
    type="text"
    placeholder="Untitled"
    value={title}
    oninput={(e) => onTitleChange((e.target as HTMLInputElement).value)}
  />
</div>
<div class="editor-subheader">
  <div class="editor-meta">
    <span>{note.folder?.name ?? 'All Notes'}</span>
    <span class="sep">·</span>
    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
  </div>
  <div class="editor-btns">
    <button class="toolbar-btn" onclick={onSummarize}>Summarize</button>
    <button
      class="toolbar-btn {showPreview ? 'primary' : ''}"
      onclick={onTogglePreview}>Preview</button
    >
    <button class="toolbar-btn" class:saved={savedRecently} onclick={onSave}>
      {savedRecently ? 'Saved ✓' : 'Save'}
    </button>
    {#if note.archived}
      <button class="toolbar-btn" onclick={onUnarchive}>Unarchive</button>
    {/if}
    <button class="toolbar-btn" onclick={onDelete}>
      {note.archived ? 'Delete Forever' : 'Delete'}
    </button>
  </div>
</div>

<style>
  .editor-title {
    flex: 1;
    min-width: 0;
    padding: 0;
    border: none;
    outline: none;
    background: transparent;
    font-family: 'Lora', Georgia, serif;
    font-size: 28px;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  .editor-title::placeholder {
    font-style: italic;
    color: var(--text-3);
  }

  .editor-subheader {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 0 14px;
    border-bottom: 1px solid var(--border);
  }

  .editor-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .editor-meta .sep {
    color: var(--text-3);
  }

  .editor-btns {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }

  .editor-btns :global(.toolbar-btn.saved) {
    border-color: rgba(120, 200, 140, 0.32);
    background: rgba(120, 200, 140, 0.1);
    color: #8acfa3;
  }

  @media (max-width: 600px) {
    .editor-title {
      font-size: 22px;
    }

    .editor-subheader {
      gap: 8px;
    }
  }
</style>
