<script lang="ts">
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

  import {
    saveNote,
    unarchiveNote,
    store,
    summarizeNote,
  } from './store.svelte';
  import { matchHotkey } from './hotkeys';

  import CodeMirrorEditor from './CodeMirrorEditor.svelte';
  import EditorHeader from './EditorHeader.svelte';
  import MarkdownView from './MarkdownView.svelte';
  import PreviewOverlay from './PreviewOverlay.svelte';
  import AiSummaryBar from './AiSummaryBar.svelte';

  let title = $state('');
  let content = $state('');
  let showPreview = $state(false);
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

  // When the active note switches, pull its current state into the local
  // editing buffer and clear any leftover AI summary. The cleanup function
  // flushes unsaved edits back to the store when we navigate away — this is
  // the only autosave path aside from the explicit Save button.
  $effect(() => {
    if (!activeNote) {
      title = '';
      content = '';
      return;
    }

    const noteId = activeNote.id;
    const baselineTitle = activeNote.title;
    const baselineContent = activeNote.content;

    title = baselineTitle;
    content = baselineContent;
    store.aiSummary = '';

    return () => {
      if (title !== baselineTitle || content !== baselineContent) {
        void saveNote(noteId, { title, content });
      }
    };
  });

  $effect(() => {
    return () => {
      if (savedTimer !== null) clearTimeout(savedTimer);
    };
  });

  async function save() {
    if (!store.activeNoteId) return;
    const ok = await saveNote(store.activeNoteId, { title, content });
    if (!ok) return;
    savedRecently = true;
    if (savedTimer !== null) clearTimeout(savedTimer);
    savedTimer = window.setTimeout(() => {
      savedRecently = false;
      savedTimer = null;
    }, 2000);
  }

  function handleDelete() {
    store.modal = { kind: 'confirm-delete-note' };
  }

  function handleSummarize() {
    if (!store.activeNoteId) return;
    summarizeNote(store.activeNoteId);
  }

  function handleUnarchive() {
    if (activeNote) unarchiveNote(activeNote.id);
  }

  function onKeydown(e: KeyboardEvent) {
    if (matchHotkey(e, { code: 'KeyP', ctrl: true, alt: true })) {
      e.preventDefault();
      showPreview = !showPreview;
    } else if (matchHotkey(e, { code: 'KeyS', ctrl: true })) {
      e.preventDefault();
      void save();
    } else if (e.key === 'Escape' && showPreview) {
      showPreview = false;
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="pane-editor">
  <div class="editor-inner">
    {#if activeNote}
      <EditorHeader
        note={activeNote}
        {title}
        {showPreview}
        {savedRecently}
        onTitleChange={(v) => (title = v)}
        onSave={save}
        onTogglePreview={() => (showPreview = !showPreview)}
        onSummarize={handleSummarize}
        onDelete={handleDelete}
        onUnarchive={handleUnarchive}
      />
    {/if}

    <div class="editor-panels">
      {#if !activeNote}
        <div class="editor-empty">
          <p>Select a note or create a new one</p>
        </div>
      {/if}
      <CodeMirrorEditor
        noteId={activeNote?.id ?? null}
        initialContent={activeNote?.content ?? ''}
        onChange={(v) => (content = v)}
      />
      {#if showPreview && activeNote}
        <div class="preview-pane">
          <MarkdownView html={previewHtml} />
        </div>
      {/if}
    </div>
  </div>

  <AiSummaryBar />
</div>

{#if showPreview && activeNote}
  <PreviewOverlay
    {title}
    html={previewHtml}
    onClose={() => (showPreview = false)}
  />
{/if}

<style>
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

  .editor-panels {
    display: flex;
    flex: 1;
    gap: 16px;
    min-height: 0;
    padding-top: 16px;
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

  .preview-pane {
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

  @media (max-width: 860px) {
    .editor-inner {
      padding: 20px 24px 0;
    }

    /* On narrow screens the fullscreen overlay replaces the split pane */
    .preview-pane {
      display: none;
    }
  }

  @media (max-width: 600px) {
    .editor-inner {
      padding: 16px 16px 0;
    }
  }
</style>
