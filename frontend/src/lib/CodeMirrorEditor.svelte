<script lang="ts">
  import { EditorView, basicSetup } from 'codemirror';
  import { markdown } from '@codemirror/lang-markdown';
  import { EditorState } from '@codemirror/state';

  interface Props {
    noteId: string | null;
    initialContent: string;
    onChange: (content: string) => void;
  }

  const { noteId, initialContent, onChange }: Props = $props();

  let container: HTMLDivElement;
  let view: EditorView | null = null;

  const listener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      onChange(update.state.doc.toString());
    }
  });

  $effect(() => {
    if (noteId === null) {
      view = null;
      return;
    }
    const v = new EditorView({
      parent: container,
      state: EditorState.create({
        doc: initialContent,
        extensions: [basicSetup, markdown(), listener, EditorView.lineWrapping],
      }),
    });
    view = v;
    return () => v.destroy();
  });
</script>

<div class="editor-body" bind:this={container}></div>

<style>
  .editor-body {
    flex: 1;
    min-width: 0;
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
    font-size: 14.5px;
    line-height: 1.85;
  }

  .editor-body :global(.cm-content) {
    padding-top: 4px;
    padding-bottom: 40px;
    caret-color: var(--accent);
    color: var(--text);
  }

  .editor-body :global(.cm-line) {
    padding: 0 6px 0 4px;
  }

  .editor-body :global(.cm-gutters) {
    padding-right: 10px !important;
    border-right: 1px solid transparent !important;
    background: transparent !important;
    color: var(--text-4) !important;
  }

  .editor-body :global(.cm-gutterElement) {
    color: var(--text-4) !important;
    font-size: 11px;
  }

  .editor-body :global(.cm-activeLineGutter) {
    background: transparent !important;
    color: var(--accent) !important;
  }

  .editor-body :global(.cm-activeLine) {
    background: rgba(140, 180, 240, 0.025) !important;
  }

  .editor-body :global(.cm-cursor),
  .editor-body :global(.cm-cursor-primary) {
    border-left: 2px solid var(--accent) !important;
    box-shadow: 0 0 8px rgba(228, 178, 89, 0.5);
  }

  .editor-body :global(.cm-selectionBackground) {
    background: rgba(228, 178, 89, 0.18) !important;
  }

  .editor-body :global(.cm-focused .cm-selectionBackground) {
    background: rgba(228, 178, 89, 0.22) !important;
  }

  .editor-body :global(.cm-line .tok-heading),
  .editor-body :global(.cm-header) {
    color: var(--accent-hi) !important;
    font-weight: 600;
  }

  .editor-body :global(.tok-emphasis) {
    font-style: italic;
    color: var(--text) !important;
  }

  .editor-body :global(.tok-strong) {
    font-weight: 600;
    color: var(--text) !important;
  }

  .editor-body :global(.tok-link),
  .editor-body :global(.tok-url) {
    color: var(--accent) !important;
  }

  .editor-body :global(.tok-meta),
  .editor-body :global(.tok-punctuation) {
    color: var(--text-3) !important;
  }

  .editor-body :global(.cm-searchMatch) {
    background: rgba(228, 178, 89, 0.25) !important;
    outline: 1px solid var(--accent);
  }

  .editor-body :global(.cm-searchMatch-selected) {
    background: rgba(228, 178, 89, 0.4) !important;
  }

  .editor-body :global(.cm-panels) {
    background: rgba(12, 20, 36, 0.95) !important;
    border-top: 1px solid var(--border) !important;
    color: var(--text);
  }

  .editor-body :global(.cm-panel) {
    background: transparent !important;
  }

  .editor-body :global(.cm-panel input) {
    background: rgba(20, 30, 50, 0.6);
    border: 1px solid var(--border-hi);
    border-radius: 6px;
    color: var(--text);
    padding: 4px 8px;
  }

  .editor-body :global(.cm-panel button) {
    background: rgba(20, 30, 50, 0.6);
    border: 1px solid var(--border-hi);
    border-radius: 6px;
    color: var(--text-2);
    padding: 3px 10px;
    margin: 0 2px;
    cursor: pointer;
  }

  .editor-body :global(.cm-panel button:hover) {
    background: rgba(30, 45, 72, 0.7);
    color: var(--text);
  }
</style>
