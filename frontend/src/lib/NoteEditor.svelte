<script lang="ts">
  import {
    saveNote,
    deleteNote,
    unarchiveNote,
    store,
    summarizeNote,
  } from './store.svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { markdown } from '@codemirror/lang-markdown';
  import { EditorState } from '@codemirror/state';
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

  let title = $state('');
  let content = $state('');
  let editorContainer: HTMLDivElement;
  let view: EditorView | null = null;
  let showPreview = $state(false);
  let showSummary = $state(false);
  let savedRecently = $state(false);
  let savedTimer: number | null = null;

  const activeNote = $derived(
    store.notes.find((n) => n.id === store.activeNoteId) ??
      store.archivedNotes.find((n) => n.id === store.activeNoteId) ??
      null
  );

  const previewHtml = $derived(
    DOMPurify.sanitize(marked.parse(content, { async: false }))
  );

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      content = update.state.doc.toString();
    }
  });

  $effect(() => {
    if (activeNote) {
      const noteId = activeNote.id;
      const baselineTitle = activeNote.title;
      const baselineContent = activeNote.content;

      title = baselineTitle;
      content = baselineContent;
      store.aiSummary = '';

      view?.destroy();

      view = new EditorView({
        parent: editorContainer,
        state: EditorState.create({
          doc: baselineContent,
          extensions: [
            basicSetup,
            markdown(),
            updateListener,
            EditorView.lineWrapping,
          ],
        }),
      });

      return () => {
        if (title !== baselineTitle || content !== baselineContent) {
          void saveNote(noteId, { title, content });
        }
      };
    } else {
      title = '';
      content = '';
      view?.destroy();
      view = null;
    }
  });

  $effect(() => {
    return () => {
      view?.destroy();
      if (savedTimer !== null) clearTimeout(savedTimer);
    };
  });

  const save = async () => {
    if (!store.activeNoteId) return;
    const ok = await saveNote(store.activeNoteId, { title, content });
    if (!ok) return;
    savedRecently = true;
    if (savedTimer !== null) clearTimeout(savedTimer);
    savedTimer = window.setTimeout(() => {
      savedRecently = false;
      savedTimer = null;
    }, 2000);
  };

  const deleteCurrentNote = () => {
    store.modal = { kind: 'confirm-delete-note' };
  };

  const handleSummarizeNote = () => {
    showSummary = false;
    summarizeNote(store.activeNoteId!);
  };

  $effect(() => {
    if (store.aiSummary && !store.aiLoading) {
      showSummary = true;
    }
  });

  function activateHotKeys(e: KeyboardEvent) {
    if (e.code === 'KeyP' && e.ctrlKey && e.altKey) {
      e.preventDefault();
      showPreview = !showPreview;
    } else if (e.code === 'KeyS' && e.ctrlKey) {
      e.preventDefault();
      save();
    } else if (e.code === 'Escape' && showPreview) {
      showPreview = false;
    }
  }
</script>

<svelte:window onkeydown={activateHotKeys} />

<div class="pane-editor">
  <div class="editor-inner">
    {#if activeNote}
      <div>
        <input
          class="editor-title"
          type="text"
          placeholder="Untitled"
          bind:value={title}
        />
      </div>
      <div class="editor-subheader">
        <div class="editor-meta">
          <span>{activeNote.folder?.name ?? 'All Notes'}</span>
          <span class="sep">·</span>
          <span>{new Date(activeNote.updatedAt).toLocaleDateString()}</span>
        </div>
        <div class="editor-btns">
          <button class="toolbar-btn" onclick={handleSummarizeNote}>
            Summarize
          </button>
          <button
            class="toolbar-btn {showPreview ? 'primary' : ''}"
            onclick={() => (showPreview = !showPreview)}>Preview</button
          >
          <button
            class="toolbar-btn"
            class:saved={savedRecently}
            onclick={save}
          >
            {savedRecently ? 'Saved ✓' : 'Save'}
          </button>
          {#if activeNote?.archived}
            <button
              class="toolbar-btn"
              onclick={() => activeNote && unarchiveNote(activeNote.id)}
              >Unarchive</button
            >
          {/if}
          <button class="toolbar-btn" onclick={deleteCurrentNote}>
            {activeNote?.archived ? 'Delete Forever' : 'Delete'}
          </button>
        </div>
      </div>
    {/if}

    <div class="editor-panels">
      {#if !activeNote}
        <div class="editor-empty">
          <p>Select a note or create a new one</p>
        </div>
      {/if}
      <div class="editor-body" bind:this={editorContainer}></div>
      {#if showPreview}
        <div class="preview-body">
          {@html previewHtml}
        </div>
      {/if}
    </div>
  </div>
  {#if store.aiLoading || store.aiSummary}
    <div class="editor-airesult" class:is-loading={store.aiLoading}>
      {#if store.aiLoading}
        <div class="airesult-loading">
          <span class="airesult-spinner"></span>
          <span>Generating summary...</span>
        </div>
      {:else}
        <button
          class="airesult-toggle"
          onclick={() => (showSummary = !showSummary)}
          aria-expanded={showSummary}
        >
          <span class="airesult-toggle-label">Summary</span>
          <span class="airesult-chevron" class:open={showSummary}>›</span>
        </button>
        {#if showSummary}
          <p class="airesult-text">{store.aiSummary}</p>
        {/if}
      {/if}
    </div>
  {/if}
</div>

{#if showPreview}
  <div
    class="preview-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Preview"
  >
    <div class="preview-overlay-header">
      <span class="preview-overlay-title">{title || 'Untitled'}</span>
      <button
        class="preview-close"
        onclick={() => (showPreview = false)}
        aria-label="Close preview">✕</button
      >
    </div>
    <div class="preview-body">
      {@html previewHtml}
    </div>
  </div>
{/if}

<style>
  /* ── CodeMirror global overrides ─────────────────────────── */

  :global(.cm-gutters) {
    padding-right: 4px !important;
    border-right: 1px solid var(--border) !important;
    background: var(--bg) !important;
  }

  :global(.cm-gutterElement) {
    color: var(--text-3) !important;
  }

  :global(.cm-activeLineGutter) {
    background: rgba(130, 170, 230, 0.05) !important;
  }

  :global(.cm-activeLine) {
    background: rgba(130, 170, 230, 0.03) !important;
  }

  :global(.cm-cursor),
  :global(.cm-cursor-primary) {
    border-left-color: var(--accent) !important;
  }

  :global(.cm-selectionBackground) {
    background: rgba(192, 144, 48, 0.18) !important;
  }

  /* ── Pane layout ────────────────────────────────────────── */

  .pane-editor {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    background: var(--bg);
  }

  .editor-inner {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    padding: 40px 32px 0;
  }

  /* ── AI result bar ──────────────────────────────────────── */

  .editor-airesult {
    flex-shrink: 0;
    border-top: 1px solid var(--border);
    background: var(--surface);
    animation: slideUp 0.2s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .airesult-loading {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    font-size: 12px;
    color: var(--text-3);
  }

  .airesult-spinner {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
    border: 1.5px solid var(--text-3);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .airesult-toggle {
    all: unset;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 11px 20px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-3);
    cursor: pointer;
    transition: color 0.12s;
  }

  .airesult-toggle:hover {
    color: var(--text-2);
  }

  .airesult-chevron {
    display: inline-block;
    font-size: 16px;
    transition: transform 0.18s ease;
  }

  .airesult-chevron.open {
    transform: rotate(90deg);
  }

  .airesult-text {
    padding: 0 20px 14px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--text-2);
  }

  /* ── Editor header ──────────────────────────────────────── */

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

  .editor-empty {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    padding-bottom: 60px;
  }

  .editor-empty p {
    font-size: 13px;
    font-style: italic;
    color: var(--text-3);
  }

  /* ── Editor panels ──────────────────────────────────────── */

  .editor-panels {
    display: flex;
    flex: 1;
    gap: 16px;
    min-height: 0;
    padding-top: 16px;
  }

  .editor-panels > .editor-body {
    flex: 1;
    min-width: 0;
  }

  .editor-body {
    max-width: 100%;
  }

  .editor-body :global(.cm-editor) {
    height: 100%;
    outline: none;
    background: transparent !important;
  }

  .editor-body :global(.cm-scroller) {
    overflow: auto;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.8;
  }

  .editor-body :global(.cm-content) {
    padding-top: 0;
    padding-bottom: 0;
    caret-color: var(--accent);
  }

  .editor-body :global(.cm-line) {
    padding: 0 0 0 2px;
  }

  /* ── Preview overlay ──────────────────────────────────── */

  .preview-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    padding: 0 24px 80px;
    background: var(--bg);
    animation: previewFadeIn 0.15s ease;
  }

  @keyframes previewFadeIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .preview-overlay-header {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 740px;
    padding: 14px 0;
    border-bottom: 1px solid var(--border);
    background: var(--bg);
  }

  .preview-overlay-title {
    overflow: hidden;
    font-size: 13px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-2);
  }

  .preview-close {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin-left: 16px;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: transparent;
    font-family: inherit;
    font-size: 14px;
    color: var(--text-2);
    cursor: pointer;
    transition:
      background 0.12s,
      color 0.12s;
  }

  .preview-close:hover {
    background: var(--surface-2);
    color: var(--text);
  }

  /* Inline split-pane (large screens) */
  .editor-panels .preview-body {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    padding: 20px 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    font-size: 14px;
    line-height: 1.8;
    color: var(--text);
  }

  /* Overlay content column */
  .preview-overlay .preview-body {
    width: 100%;
    max-width: 740px;
    padding: 36px 0;
    font-size: 15px;
    line-height: 1.85;
    color: var(--text);
  }

  /* Hide overlay on large screens */
  .preview-overlay {
    display: none;
  }

  /* ── Responsive ─────────────────────────────────────────── */

  @media (max-width: 860px) {
    .editor-inner {
      padding: 20px 24px 0;
    }

    .editor-panels .preview-body {
      display: none;
    }

    .preview-overlay {
      display: flex;
    }
  }

  @media (max-width: 600px) {
    .editor-inner {
      padding: 16px 16px 0;
    }

    .editor-title {
      font-size: 22px;
    }

    .editor-subheader {
      gap: 8px;
    }
  }

  /* ── Markdown preview content ─────────────────────────── */

  .preview-body :global(h1),
  .preview-body :global(h2),
  .preview-body :global(h3),
  .preview-body :global(h4),
  .preview-body :global(h5),
  .preview-body :global(h6) {
    margin: 1.4em 0 0.4em;
    font-family: 'Lora', Georgia, serif;
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.01em;
    color: var(--text);
  }

  .preview-body :global(h1) {
    font-size: 1.75em;
  }
  .preview-body :global(h2) {
    font-size: 1.35em;
  }
  .preview-body :global(h3) {
    font-size: 1.1em;
  }

  .preview-body :global(p) {
    margin: 0.75em 0;
  }

  .preview-body :global(a) {
    text-decoration: underline;
    text-decoration-color: rgba(192, 144, 48, 0.45);
    text-underline-offset: 2px;
    color: var(--accent);
  }

  .preview-body :global(a:hover) {
    text-decoration-color: var(--accent);
  }

  .preview-body :global(code) {
    padding: 1px 5px;
    border: 1px solid var(--border);
    border-radius: 3px;
    background: var(--surface-2);
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 0.87em;
  }

  .preview-body :global(pre) {
    overflow-x: auto;
    margin: 1em 0;
    padding: 14px 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface-2);
  }

  .preview-body :global(pre code) {
    padding: 0;
    border: none;
    background: none;
    font-size: 0.87em;
  }

  .preview-body :global(blockquote) {
    margin: 1em 0;
    padding: 4px 0 4px 18px;
    border-left: 2px solid var(--accent);
    color: var(--text-2);
  }

  .preview-body :global(ul),
  .preview-body :global(ol) {
    margin: 0.75em 0;
    padding-left: 1.5em;
  }

  .preview-body :global(li) {
    margin: 0.25em 0;
  }

  .preview-body :global(hr) {
    margin: 1.75em 0;
    border: none;
    border-top: 1px solid var(--border);
  }

  .preview-body :global(table) {
    width: 100%;
    margin: 1em 0;
    border-collapse: collapse;
    font-size: 0.92em;
  }

  .preview-body :global(th),
  .preview-body :global(td) {
    padding: 7px 12px;
    border: 1px solid var(--border);
    text-align: left;
  }

  .preview-body :global(th) {
    background: var(--surface-2);
    font-size: 0.85em;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
</style>
