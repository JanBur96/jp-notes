<script lang="ts">
  import { store } from './store.svelte';
</script>

{#if store.hasError}
  <div class="toolbar-error">
    <span class="error-message">{store.hasError}</span>
    <button
      class="toolbar-btn toolbar-btn--error"
      onclick={() => (store.hasError = '')}>Dismiss</button
    >
  </div>
{/if}

<style>
  .toolbar-error {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 6px;
    padding: 10px 14px;
    border: 1px solid rgba(200, 60, 60, 0.22);
    border-radius: var(--radius);
    background: rgba(200, 60, 60, 0.07);
    font-size: 13px;
  }
</style>
