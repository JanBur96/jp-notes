<script lang="ts">
  interface Props {
    html: string;
  }

  const { html }: Props = $props();
</script>

<div class="markdown-view">
  {@html html}
</div>

<style>
  .markdown-view :global(h1),
  .markdown-view :global(h2),
  .markdown-view :global(h3),
  .markdown-view :global(h4),
  .markdown-view :global(h5),
  .markdown-view :global(h6) {
    margin: 1.4em 0 0.4em;
    font-family: 'Lora', Georgia, serif;
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.01em;
    color: var(--text);
  }

  .markdown-view :global(h1) {
    font-size: 1.75em;
  }
  .markdown-view :global(h2) {
    font-size: 1.35em;
  }
  .markdown-view :global(h3) {
    font-size: 1.1em;
  }

  .markdown-view :global(p) {
    margin: 0.75em 0;
  }

  .markdown-view :global(a) {
    text-decoration: underline;
    text-decoration-color: rgba(192, 144, 48, 0.45);
    text-underline-offset: 2px;
    color: var(--accent);
  }

  .markdown-view :global(a:hover) {
    text-decoration-color: var(--accent);
  }

  .markdown-view :global(code) {
    padding: 1px 5px;
    border: 1px solid var(--border);
    border-radius: 3px;
    background: var(--surface-2);
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 0.87em;
  }

  .markdown-view :global(pre) {
    overflow-x: auto;
    margin: 1em 0;
    padding: 14px 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface-2);
  }

  .markdown-view :global(pre code) {
    padding: 0;
    border: none;
    background: none;
    font-size: 0.87em;
  }

  .markdown-view :global(blockquote) {
    margin: 1em 0;
    padding: 4px 0 4px 18px;
    border-left: 2px solid var(--accent);
    color: var(--text-2);
  }

  .markdown-view :global(ul),
  .markdown-view :global(ol) {
    margin: 0.75em 0;
    padding-left: 1.5em;
  }

  .markdown-view :global(li) {
    margin: 0.25em 0;
  }

  .markdown-view :global(hr) {
    margin: 1.75em 0;
    border: none;
    border-top: 1px solid var(--border);
  }

  .markdown-view :global(table) {
    width: 100%;
    margin: 1em 0;
    border-collapse: collapse;
    font-size: 0.92em;
  }

  .markdown-view :global(th),
  .markdown-view :global(td) {
    padding: 7px 12px;
    border: 1px solid var(--border);
    text-align: left;
  }

  .markdown-view :global(th) {
    background: var(--surface-2);
    font-size: 0.85em;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
</style>
