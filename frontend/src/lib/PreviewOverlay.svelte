<script lang="ts">
  import MarkdownView from './MarkdownView.svelte';

  interface Props {
    title: string;
    html: string;
    onClose: () => void;
  }

  const { title, html, onClose }: Props = $props();
</script>

<div
  class="preview-overlay"
  role="dialog"
  aria-modal="true"
  aria-label="Preview"
>
  <div class="preview-overlay-header">
    <span class="preview-overlay-title">{title || 'Untitled'}</span>
    <button class="preview-close" onclick={onClose} aria-label="Close preview"
      >✕</button
    >
  </div>
  <div class="preview-overlay-body">
    <MarkdownView {html} />
  </div>
</div>

<style>
  .preview-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: none;
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

  .preview-overlay-body {
    width: 100%;
    max-width: 740px;
    padding: 36px 0;
    font-size: 15px;
    line-height: 1.85;
    color: var(--text);
  }

  /* Only show the overlay on narrow screens — on desktop the inline split
     pane handles preview instead. */
  @media (max-width: 860px) {
    .preview-overlay {
      display: flex;
    }
  }
</style>
