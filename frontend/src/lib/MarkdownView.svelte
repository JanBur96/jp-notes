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
    margin: 1.5em 0 0.5em;
    font-family: 'Lora', Georgia, serif;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.018em;
    color: var(--text);
  }

  .markdown-view :global(h1) {
    font-size: 1.9em;
  }
  .markdown-view :global(h2) {
    font-size: 1.45em;
  }
  .markdown-view :global(h3) {
    font-size: 1.15em;
  }

  .markdown-view :global(h1:first-child),
  .markdown-view :global(h2:first-child),
  .markdown-view :global(h3:first-child) {
    margin-top: 0;
  }

  .markdown-view :global(p) {
    margin: 0.85em 0;
  }

  .markdown-view :global(a) {
    text-decoration: underline;
    text-decoration-color: rgba(228, 178, 89, 0.4);
    text-underline-offset: 3px;
    color: var(--accent-hi);
    transition: text-decoration-color var(--dur) var(--ease);
  }

  .markdown-view :global(a:hover) {
    text-decoration-color: var(--accent);
  }

  .markdown-view :global(code) {
    padding: 1px 6px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: rgba(8, 14, 26, 0.7);
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 0.86em;
    color: var(--accent-hi);
  }

  .markdown-view :global(pre) {
    overflow-x: auto;
    margin: 1.2em 0;
    padding: 16px 20px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: rgba(8, 14, 26, 0.7);
  }

  .markdown-view :global(pre code) {
    padding: 0;
    border: none;
    background: none;
    font-size: 0.88em;
    color: var(--text);
  }

  .markdown-view :global(blockquote) {
    position: relative;
    margin: 1.2em 0;
    padding: 6px 0 6px 22px;
    border-left: 2px solid var(--accent);
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    color: var(--text-2);
  }

  .markdown-view :global(ul),
  .markdown-view :global(ol) {
    margin: 0.85em 0;
    padding-left: 1.6em;
  }

  .markdown-view :global(li) {
    margin: 0.3em 0;
  }

  .markdown-view :global(ul li::marker) {
    color: var(--accent);
  }

  .markdown-view :global(hr) {
    margin: 2em 0;
    border: none;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--border-hi) 50%,
      transparent
    );
  }

  .markdown-view :global(table) {
    width: 100%;
    margin: 1.2em 0;
    border-collapse: collapse;
    font-size: 0.94em;
  }

  .markdown-view :global(th),
  .markdown-view :global(td) {
    padding: 9px 14px;
    border: 1px solid var(--border);
    text-align: left;
  }

  .markdown-view :global(th) {
    background: rgba(18, 28, 48, 0.5);
    font-size: 0.82em;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-2);
  }

  .markdown-view :global(strong) {
    font-weight: 600;
    color: var(--text);
  }

  .markdown-view :global(em) {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
  }
</style>
