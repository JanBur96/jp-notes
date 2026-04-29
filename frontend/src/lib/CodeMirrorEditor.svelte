<script lang="ts">
  import { untrack } from 'svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { keymap } from '@codemirror/view';
  import { markdown } from '@codemirror/lang-markdown';
  import { EditorState, Prec } from '@codemirror/state';
  import { markdownShortcuts } from './markdownShortcuts';

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
    const doc = untrack(() => initialContent);
    const v = new EditorView({
      parent: container,
      state: EditorState.create({
        doc,
        extensions: [
          Prec.high(keymap.of(markdownShortcuts)),
          basicSetup,
          markdown(),
          listener,
          EditorView.lineWrapping,
        ],
      }),
    });
    view = v;
    return () => v.destroy();
  });
</script>

<div class="code-editor" bind:this={container}></div>

<style>
  .code-editor {
    flex: 1;
    min-width: 0;
    max-width: 100%;
  }

  .code-editor :global(.cm-editor) {
    height: 100%;
    outline: none;
    background: transparent !important;
  }

  .code-editor :global(.cm-scroller) {
    overflow: auto;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 14.5px;
    line-height: 1.85;
  }

  .code-editor :global(.cm-content) {
    padding-top: 4px;
    padding-bottom: 40px;
    caret-color: var(--accent);
    color: var(--text);
  }

  .code-editor :global(.cm-line) {
    padding: 0 6px 0 4px;
  }

  .code-editor :global(.cm-gutters) {
    padding-right: 10px !important;
    border-right: 1px solid transparent !important;
    background: transparent !important;
    color: var(--text-4) !important;
  }

  .code-editor :global(.cm-gutterElement) {
    color: var(--text-4) !important;
    font-size: 11px;
  }

  .code-editor :global(.cm-activeLineGutter) {
    background: transparent !important;
    color: var(--accent) !important;
  }

  .code-editor :global(.cm-activeLine) {
    background: rgba(140, 180, 240, 0.025) !important;
  }

  .code-editor :global(.cm-cursor),
  .code-editor :global(.cm-cursor-primary) {
    border-left: 2px solid var(--accent) !important;
    box-shadow: 0 0 8px rgba(228, 178, 89, 0.5);
  }

  .code-editor :global(.cm-selectionBackground) {
    background: rgba(228, 178, 89, 0.18) !important;
  }

  .code-editor :global(.cm-focused .cm-selectionBackground) {
    background: rgba(228, 178, 89, 0.22) !important;
  }

  .code-editor :global(.cm-line .tok-heading),
  .code-editor :global(.cm-header) {
    color: var(--accent-hi) !important;
    font-weight: 600;
  }

  .code-editor :global(.tok-emphasis) {
    font-style: italic;
    color: var(--text) !important;
  }

  .code-editor :global(.tok-strong) {
    font-weight: 600;
    color: var(--text) !important;
  }

  .code-editor :global(.tok-link),
  .code-editor :global(.tok-url) {
    color: var(--accent) !important;
  }

  .code-editor :global(.tok-meta),
  .code-editor :global(.tok-punctuation) {
    color: var(--text-3) !important;
  }

  .code-editor :global(.cm-searchMatch) {
    background: rgba(228, 178, 89, 0.25) !important;
    outline: 1px solid var(--accent);
  }

  .code-editor :global(.cm-searchMatch-selected) {
    background: rgba(228, 178, 89, 0.4) !important;
  }

  .code-editor :global(.cm-panels) {
    background: rgba(12, 20, 36, 0.95) !important;
    border-top: 1px solid var(--border) !important;
    color: var(--text);
  }

  .code-editor :global(.cm-panel) {
    background: transparent !important;
  }

  .code-editor :global(.cm-panel input) {
    background: rgba(20, 30, 50, 0.6);
    border: 1px solid var(--border-hi);
    border-radius: 6px;
    color: var(--text);
    padding: 4px 8px;
  }

  .code-editor :global(.cm-panel button) {
    background: rgba(20, 30, 50, 0.6);
    border: 1px solid var(--border-hi);
    border-radius: 6px;
    color: var(--text-2);
    padding: 3px 10px;
    margin: 0 2px;
    cursor: pointer;
  }

  .code-editor :global(.cm-panel button:hover) {
    background: rgba(30, 45, 72, 0.7);
    color: var(--text);
  }
</style>
