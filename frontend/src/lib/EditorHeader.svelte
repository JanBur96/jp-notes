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

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
</script>

<div class="editor-header">
  <input
    class="editor-title"
    type="text"
    placeholder="Untitled"
    value={title}
    oninput={(e) => onTitleChange((e.target as HTMLInputElement).value)}
  />

  <div class="editor-subheader">
    <div class="editor-meta">
      <span class="meta-chip">
        <svg viewBox="0 0 14 14" width="10" height="10" fill="none" aria-hidden="true">
          <path
            d="M2 4c0-.55.45-1 1-1h2.3c.26 0 .52.1.7.29l.8.8c.19.19.44.29.71.29H11c.55 0 1 .45 1 1v5c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1V4z"
            stroke="currentColor"
            stroke-width="1.1"
          />
        </svg>
        {note.folder?.name ?? 'All Notes'}
      </span>
      <span class="meta-dot"></span>
      <span class="meta-chip">
        <svg viewBox="0 0 14 14" width="10" height="10" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.1"/>
          <path d="M7 4v3l2 1.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
        </svg>
        {formatDate(note.updatedAt)}
      </span>
    </div>

    <div class="editor-btns">
      <button class="toolbar-btn" onclick={onSummarize} title="Generate AI summary">
        <svg viewBox="0 0 14 14" width="11" height="11" fill="none" aria-hidden="true">
          <path
            d="M7 1.5l1.5 3.5 3.5 1-2.5 2.5.5 3.5L7 10.5 3 12l.5-3.5L1 6l3.5-1L7 1.5z"
            stroke="currentColor"
            stroke-width="1.1"
            stroke-linejoin="round"
          />
        </svg>
        Summarize
      </button>
      <button
        class="toolbar-btn {showPreview ? 'primary' : ''}"
        onclick={onTogglePreview}
      >
        <svg viewBox="0 0 14 14" width="11" height="11" fill="none" aria-hidden="true">
          <path
            d="M1 7s2-4.5 6-4.5S13 7 13 7s-2 4.5-6 4.5S1 7 1 7z"
            stroke="currentColor"
            stroke-width="1.1"
          />
          <circle cx="7" cy="7" r="1.8" stroke="currentColor" stroke-width="1.1"/>
        </svg>
        Preview
      </button>
      <button class="toolbar-btn" class:saved={savedRecently} onclick={onSave}>
        {#if savedRecently}
          <svg viewBox="0 0 14 14" width="11" height="11" fill="none" aria-hidden="true">
            <path d="M2.5 7.5l3 3 6-6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Saved
        {:else}
          <svg viewBox="0 0 14 14" width="11" height="11" fill="none" aria-hidden="true">
            <path d="M2.5 3c0-.55.45-1 1-1h6.79c.26 0 .52.1.7.29l1.21 1.21c.19.19.3.45.3.71V11c0 .55-.45 1-1 1h-8c-.55 0-1-.45-1-1V3z" stroke="currentColor" stroke-width="1.1"/>
            <path d="M4.5 2v2.5h5V2" stroke="currentColor" stroke-width="1.1"/>
          </svg>
          Save
        {/if}
      </button>
      {#if note.archived}
        <button class="toolbar-btn" onclick={onUnarchive}>Unarchive</button>
      {/if}
      <button
        class="toolbar-btn {note.archived ? 'toolbar-btn--error' : ''}"
        onclick={onDelete}
      >
        {note.archived ? 'Delete Forever' : 'Delete'}
      </button>
    </div>
  </div>
</div>

<style>
  .editor-header {
    flex-shrink: 0;
  }

  .editor-title {
    width: 100%;
    padding: 0;
    border: none;
    outline: none;
    background: transparent;
    font-family: 'Lora', Georgia, serif;
    font-size: 36px;
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.025em;
    color: var(--text);
  }

  .editor-title::placeholder {
    font-style: italic;
    color: var(--text-4);
  }

  .editor-subheader {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 0 18px;
    margin-top: 14px;
  }

  /* Gold-accented hairline under the header */
  .editor-subheader::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(228, 178, 89, 0.28),
      rgba(140, 180, 240, 0.08) 30%,
      transparent
    );
  }

  .editor-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    font-weight: 500;
    color: var(--text-3);
  }

  .meta-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    letter-spacing: 0.02em;
  }

  .meta-chip svg {
    color: var(--text-3);
  }

  .meta-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--text-4);
  }

  .editor-btns {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 7px;
  }

  .editor-btns :global(.toolbar-btn.saved) {
    border-color: rgba(120, 210, 150, 0.34);
    background: rgba(120, 210, 150, 0.12);
    color: #8bd0a3;
  }

  @media (max-width: 860px) {
    .editor-title {
      font-size: 30px;
    }
  }

  @media (max-width: 600px) {
    .editor-title {
      font-size: 24px;
    }

    .editor-subheader {
      gap: 10px;
      padding: 12px 0 14px;
      margin-top: 10px;
    }
  }
</style>
