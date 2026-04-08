<script lang="ts">
  import { EditorView, basicSetup } from 'codemirror';
  import { markdown } from '@codemirror/lang-markdown';
  import { EditorState } from '@codemirror/state';

  interface Props {
    /**
     * Identity of the current document. When this changes, the view is
     * torn down and rebuilt from `initialContent`. Passing `null` means
     * no document is active and the editor should render as empty.
     */
    noteId: string | null;
    /**
     * Seed text used when a new view is created. Subsequent updates from
     * within the editor are reported via `onChange`; we do not push external
     * changes back in after construction.
     */
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

  // Recreate the view whenever the active note changes. Using `noteId` as
  // the dependency means edits don't trigger rebuilds — only navigation.
  // The cleanup runs before the next effect AND on unmount, so the old
  // view is always torn down before a new one is attached.
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

  .editor-body :global(.cm-gutters) {
    padding-right: 4px !important;
    border-right: 1px solid var(--border) !important;
    background: var(--bg) !important;
  }

  .editor-body :global(.cm-gutterElement) {
    color: var(--text-3) !important;
  }

  .editor-body :global(.cm-activeLineGutter) {
    background: rgba(130, 170, 230, 0.05) !important;
  }

  .editor-body :global(.cm-activeLine) {
    background: rgba(130, 170, 230, 0.03) !important;
  }

  .editor-body :global(.cm-cursor),
  .editor-body :global(.cm-cursor-primary) {
    border-left-color: var(--accent) !important;
  }

  .editor-body :global(.cm-selectionBackground) {
    background: rgba(192, 144, 48, 0.18) !important;
  }
</style>
