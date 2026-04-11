<script lang="ts">
  import { store } from './store.svelte';
</script>

{#if store.hasError}
  <div class="error-banner" role="alert">
    <span class="error-banner__icon" aria-hidden="true">
      <svg viewBox="0 0 14 14" width="14" height="14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.3"/>
        <path d="M7 4v3.5M7 9.8v.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </span>
    <span class="error-banner__message">{store.hasError}</span>
    <button
      class="toolbar-btn toolbar-btn--error"
      onclick={() => (store.hasError = '')}>Dismiss</button
    >
  </div>
{/if}

<style>
  .error-banner {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 8px 16px 0;
    padding: 10px 14px;
    border: 1px solid rgba(212, 112, 112, 0.26);
    border-radius: var(--radius);
    background:
      linear-gradient(180deg, rgba(50, 18, 18, 0.5), rgba(30, 10, 10, 0.3));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 4px 18px -6px rgba(220, 80, 80, 0.3);
    font-size: 13px;
    color: var(--text);
    animation: errorIn 0.18s var(--ease);
  }

  @keyframes errorIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .error-banner__icon {
    flex-shrink: 0;
    display: inline-flex;
    color: var(--danger);
  }

  .error-banner__message {
    flex: 1;
  }
</style>
