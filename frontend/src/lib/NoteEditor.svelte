<script lang="ts">
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';
  import hljs from 'highlight.js';
  import 'highlight.js/styles/github-dark.css';

  import {
    saveNote,
    unarchiveNote,
    loadNotes,
    store,
    summarizeNote,
  } from './store.svelte';
  import { matchHotkey } from './hotkeys';
  import { wikilinkExtension } from './wikilinks';

  marked.use({
    renderer: {
      code({ text, lang }) {
        const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
        const highlighted = hljs.highlight(text, { language }).value;
        return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
      },
    },
    extensions: [wikilinkExtension],
  });

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

  async function handleWikilinkClick(e: MouseEvent) {
    const el = (e.target as HTMLElement).closest('.wikilink');
    if (!el) return;
    e.preventDefault();

    const linkTitle = el.getAttribute('data-title');
    if (!linkTitle) return;

    const target = store.notes.find(
      (n) => n.title.toLowerCase() === linkTitle.toLowerCase()
    );
    if (!target) return;

    if (store.activeFolderId !== target.folderId) {
      store.activeFolderId = target.folderId;
      await loadNotes(target.folderId);
    }
    if (store.archiveMode) store.archiveMode = false;
    store.activeNoteId = target.id;
    store.mobilePane = 'editor';
  }

  function onKeydown(e: KeyboardEvent) {
    if (savedTimer !== null) clearTimeout(savedTimer);
    savedTimer = window.setTimeout(() => {
      void save();
    }, 2000);

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

<main class="pane-editor">
  {#if activeNote}
    <div class="editor-inner">
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

      <div class="editor-panels">
        <CodeMirrorEditor
          noteId={activeNote?.id ?? null}
          initialContent={activeNote?.content ?? ''}
          onChange={(v) => (content = v)}
        />
        {#if showPreview}
          <div class="preview-pane">
            <MarkdownView html={previewHtml} onclick={handleWikilinkClick} />
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <div class="editor-empty">
      <div class="empty-ornament" aria-hidden="true">
        <svg viewBox="0 0 80 80" fill="none">
          <circle
            cx="40"
            cy="40"
            r="38"
            stroke="url(#ringStroke)"
            stroke-width="0.6"
            stroke-dasharray="2 4"
          />
          <circle
            cx="40"
            cy="40"
            r="26"
            stroke="url(#ringStroke)"
            stroke-width="0.8"
          />
          <path
            d="M28 32h24M28 40h24M28 48h16"
            stroke="url(#ringStroke)"
            stroke-width="1.4"
            stroke-linecap="round"
          />
          <defs>
            <linearGradient id="ringStroke" x1="0" y1="0" x2="80" y2="80">
              <stop offset="0" stop-color="#f1c774" stop-opacity="0.8" />
              <stop offset="1" stop-color="#c89040" stop-opacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h2 class="empty-heading">No note selected</h2>
      <p class="empty-sub">Select a note or create a new one.</p>
      <div class="empty-hint">
        <kbd>Ctrl</kbd><span>+</span><kbd>Alt</kbd><span>+</span><kbd>N</kbd>
        <span class="empty-hint-label">for a new note</span>
      </div>
    </div>
  {/if}

  <AiSummaryBar />
</main>

{#if showPreview && activeNote}
  <PreviewOverlay
    {title}
    html={previewHtml}
    onClose={() => (showPreview = false)}
    onWikilinkClick={handleWikilinkClick}
  />
{/if}

<style>
  .pane-editor {
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: stretch;
    overflow: hidden;
  }

  .editor-inner {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    padding: 44px 48px 0;
  }

  .editor-panels {
    display: flex;
    flex: 1;
    gap: 20px;
    min-height: 0;
    padding-top: 20px;
  }

  .editor-empty {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
    padding: 40px 24px 100px;
    text-align: center;
  }

  .empty-ornament {
    position: relative;
    width: 96px;
    height: 96px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: breathe 6s ease-in-out infinite;
  }

  .empty-ornament::before {
    content: '';
    position: absolute;
    inset: -20px;
    background: radial-gradient(
      circle at center,
      rgba(228, 178, 89, 0.14),
      transparent 65%
    );
    filter: blur(8px);
  }

  .empty-ornament svg {
    position: relative;
    width: 100%;
    height: 100%;
  }

  @keyframes breathe {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.92;
    }
    50% {
      transform: scale(1.03);
      opacity: 1;
    }
  }

  .empty-heading {
    margin-top: 6px;
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 28px;
    font-weight: 500;
    letter-spacing: -0.015em;
    color: var(--text);
  }

  .empty-sub {
    max-width: 320px;
    font-size: 13px;
    line-height: 1.65;
    color: var(--text-2);
  }

  .empty-hint {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 10px;
    font-size: 11px;
    color: var(--text-3);
  }

  .empty-hint kbd {
    display: inline-flex;
    align-items: center;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    justify-content: center;
    border: 1px solid var(--border-hi);
    border-bottom-color: rgba(140, 180, 240, 0.2);
    border-radius: 5px;
    background: rgba(20, 30, 50, 0.6);
    box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.3);
    font-family: inherit;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--text-2);
  }

  .empty-hint-label {
    margin-left: 8px;
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 12px;
    color: var(--text-3);
  }

  .preview-pane {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    padding: 28px 32px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: linear-gradient(
      180deg,
      rgba(15, 24, 42, 0.55),
      rgba(8, 14, 26, 0.4)
    );
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: var(--shadow-md);
    font-size: 14.5px;
    line-height: 1.8;
    color: var(--text);
  }

  @media (max-width: 860px) {
    .editor-inner {
      padding: 28px 32px 0;
    }

    .preview-pane {
      display: none;
    }
  }

  @media (max-width: 600px) {
    .editor-inner {
      padding: 18px 18px 0;
    }

    .empty-heading {
      font-size: 22px;
    }
  }
</style>
