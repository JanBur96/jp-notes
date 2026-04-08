<script lang="ts">
  import type { Snippet } from 'svelte';
  import { store } from './store.svelte';

  const { title, children }: { title: string; children: Snippet } = $props();
</script>

<div class="modal-backdrop">
  <div class="modal-content">
    <div class="modal-header">
      <h2>{title}</h2>
      <button class="modal-close" aria-label="Close" onclick={() => (store.modal = null)}
        >×</button
      >
    </div>
    <div class="modal-body">
      {@render children()}
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .modal-content {
    width: calc(100% - 32px);
    max-width: 440px;
    height: max-content;
    margin-top: 12vh;
    padding: 24px;
    border: 1px solid rgba(130, 170, 230, 0.15);
    border-radius: 10px;
    background: var(--surface-2);
    box-shadow:
      0 24px 64px rgba(0, 0, 0, 0.6),
      0 4px 16px rgba(0, 0, 0, 0.4);
    color: var(--text);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .modal-header h2 {
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
  }

  .modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: none;
    font-size: 18px;
    line-height: 1;
    color: var(--text-3);
    cursor: pointer;
    transition: color 0.12s;
  }

  .modal-close:hover {
    color: var(--text-2);
  }

  .modal-body {
    padding: 0;
  }
</style>
