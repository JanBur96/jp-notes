<script lang="ts">
  import { saveNote, deleteNote, unarchiveNote, store } from './store.svelte';
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
      title = activeNote.title;
      content = activeNote.content;

      view?.destroy();

      view = new EditorView({
        parent: editorContainer,
        state: EditorState.create({
          doc: activeNote.content,
          extensions: [basicSetup, markdown(), updateListener],
        }),
      });
    } else {
      title = '';
      content = '';
      view?.destroy();
      view = null;
    }
  });

  $effect(() => {
    return () => view?.destroy();
  });

  const save = () => {
    if (store.activeNoteId) {
      saveNote(store.activeNoteId, { title, content });
    }
  };

  const deleteCurrentNote = () => {
    store.modal = { kind: 'confirm-delete-note' };
  };
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape' && showPreview) showPreview = false;
  }}
/>

<div class="pane-editor">
  {#if activeNote}
    <div class="editor-header">
      <input
        class="editor-title"
        type="text"
        placeholder="Untitled"
        bind:value={title}
      />
      <button
        class="toolbar-btn {showPreview ? 'primary' : ''}"
        onclick={() => (showPreview = !showPreview)}>Preview</button
      >
      <button class="toolbar-btn" onclick={save}>Save</button>
      {#if activeNote?.archived}
        <button class="toolbar-btn" onclick={() => activeNote && unarchiveNote(activeNote.id)}>Unarchive</button>
      {/if}
      <button class="toolbar-btn" onclick={deleteCurrentNote}>
        {activeNote?.archived ? 'Delete Forever' : 'Delete'}
      </button>
    </div>

    <div class="editor-meta">
      <span>{activeNote.folder?.name ?? ''}</span>
      <span class="sep">·</span>
      <span>{new Date(activeNote.createdAt).toLocaleDateString()}</span>
    </div>
  {/if}

  <div class="editor-panels">
    <div class="editor-body" bind:this={editorContainer}></div>
    {#if showPreview}
      <div class="preview-body">
        {@html previewHtml}
      </div>
    {/if}
  </div>
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
