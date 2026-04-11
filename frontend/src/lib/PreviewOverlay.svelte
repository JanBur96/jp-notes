<script lang="ts">
  import MarkdownView from './MarkdownView.svelte';

  interface Props {
    title: string;
    html: string;
    onClose: () => void;
    onWikilinkClick?: (e: MouseEvent) => void;
  }

  const { title, html, onClose, onWikilinkClick }: Props = $props();

  function handleBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('preview-overlay')) {
      onClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="preview-overlay"
  role="dialog"
  aria-modal="true"
  aria-label="Preview"
  onclick={handleBackdropClick}
>
  <div class="preview-overlay__header">
    <span class="preview-overlay__title">{title || 'Untitled'}</span>
    <button
      class="preview-overlay__close"
      onclick={onClose}
      aria-label="Close preview"
    >
      <svg viewBox="0 0 14 14" width="14" height="14" fill="none">
        <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
  <div class="preview-overlay__body">
    <MarkdownView {html} onclick={onWikilinkClick} />
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
    padding: 0 0 80px;
    background:
      radial-gradient(ellipse 80% 60% at 15% 0%, rgba(228, 178, 89, 0.08), transparent 60%),
      var(--bg);
    animation: previewFadeIn 0.2s var(--ease);
  }

  @keyframes previewFadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .preview-overlay__header {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 18px 24px;
    background: linear-gradient(180deg, var(--bg) 80%, transparent);
  }

  .preview-overlay__title {
    overflow: hidden;
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 14px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-2);
  }

  .preview-overlay__close {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-left: 16px;
    border: 1px solid var(--border-hi);
    border-radius: 8px;
    background: rgba(20, 30, 50, 0.5);
    color: var(--text-2);
    cursor: pointer;
    transition:
      background var(--dur) var(--ease),
      color var(--dur) var(--ease),
      border-color var(--dur) var(--ease);
  }

  .preview-overlay__close:hover {
    background: rgba(30, 45, 72, 0.7);
    border-color: rgba(140, 180, 240, 0.24);
    color: var(--text);
  }

  .preview-overlay__body {
    width: 100%;
    max-width: 760px;
    padding: 40px 24px 60px;
    font-size: 15.5px;
    line-height: 1.85;
    color: var(--text);
  }

  @media (max-width: 860px) {
    .preview-overlay {
      display: flex;
    }
  }

  @media (max-width: 600px) {
    .preview-overlay__close {
      width: 44px;
      height: 44px;
    }
  }
</style>
