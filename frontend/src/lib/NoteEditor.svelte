<script lang="ts">
  import { saveNote, deleteNote, store } from './store.svelte';
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
    store.notes.find((n) => n.id === store.activeNoteId) ?? null
  );

  const previewHtml = $derived(
    DOMPurify.sanitize(marked.parse(content) as string)
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
    if (store.activeNoteId) {
      deleteNote(store.activeNoteId);
    }
  };
</script>

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
      <!-- TODO: Pop Up you really want to delete? -->
      <!-- TODO: Put note in archive -->
      <button class="toolbar-btn" onclick={deleteCurrentNote}>Delete</button>
    </div>

    <div class="editor-meta">
      <span>{activeNote?.folder?.name ?? ''}</span>
      <span class="sep">·</span>
      <span>
        {activeNote?.createdAt
          ? new Date(activeNote.createdAt).toLocaleDateString()
          : ''}
      </span>
      <!-- Phase 2: Tags display
      <span class="sep">·</span>
      {#each activeNote?.tags || [] as tag}
        <span class="tag">{tag.name}</span>
      {/each}
      -->
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
