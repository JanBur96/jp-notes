<script lang="ts">
  import type { Snippet } from 'svelte';
  import { store } from './store.svelte';

  const { title, children }: { title: string; children: Snippet } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="modal-backdrop" onclick={() => (store.modal = null)}>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="modal-content" onclick={(e) => e.stopPropagation()}>
    <div class="modal-glow" aria-hidden="true"></div>
    <div class="modal-header">
      <h2>{title}</h2>
      <button
        class="modal-close"
        aria-label="Close"
        onclick={() => (store.modal = null)}
      >
        <svg viewBox="0 0 14 14" width="14" height="14" fill="none">
          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div class="modal-body">
      {@render children()}
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    justify-content: center;
    background: rgba(3, 7, 17, 0.72);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    animation: fadeIn 0.18s var(--ease);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    position: relative;
    width: calc(100% - 32px);
    max-width: 460px;
    height: max-content;
    margin-top: 14vh;
    padding: 26px 28px 28px;
    border: 1px solid rgba(140, 180, 240, 0.16);
    border-radius: 14px;
    background:
      linear-gradient(180deg, rgba(22, 32, 52, 0.92), rgba(12, 20, 36, 0.92));
    backdrop-filter: blur(24px) saturate(140%);
    -webkit-backdrop-filter: blur(24px) saturate(140%);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      0 32px 80px -20px rgba(0, 0, 0, 0.75),
      0 8px 32px -8px rgba(0, 0, 0, 0.5);
    color: var(--text);
    animation: modalIn 0.22s var(--ease);
  }

  @keyframes modalIn {
    from { opacity: 0; transform: translateY(-8px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .modal-glow {
    position: absolute;
    top: 0;
    left: 20%;
    right: 20%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(228, 178, 89, 0.55) 50%,
      transparent
    );
    pointer-events: none;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .modal-header h2 {
    font-family: 'Lora', Georgia, serif;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.015em;
    color: var(--text);
  }

  .modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: rgba(20, 30, 50, 0.4);
    color: var(--text-3);
    cursor: pointer;
    transition:
      color var(--dur) var(--ease),
      background var(--dur) var(--ease),
      border-color var(--dur) var(--ease);
  }

  .modal-close:hover {
    color: var(--text);
    background: rgba(30, 45, 72, 0.7);
    border-color: var(--border-hi);
  }

  .modal-body {
    padding: 0;
  }
</style>
