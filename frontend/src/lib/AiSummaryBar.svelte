<script lang="ts">
  import { store } from './store.svelte';

  let showSummary = $state(false);

  // Auto-open the panel once a new summary finishes generating
  $effect(() => {
    if (store.aiSummary && !store.aiLoading) {
      showSummary = true;
    }
  });
</script>

{#if store.aiLoading || store.aiSummary}
  <div class="ai-result" class:is-loading={store.aiLoading}>
    {#if store.aiLoading}
      <div class="ai-loading">
        <span class="ai-spinner"></span>
        <span>Generating summary...</span>
      </div>
    {:else}
      <button
        class="ai-toggle"
        onclick={() => (showSummary = !showSummary)}
        aria-expanded={showSummary}
      >
        <span>Summary</span>
        <span class="ai-chevron" class:open={showSummary}>›</span>
      </button>
      {#if showSummary}
        <p class="ai-text">{store.aiSummary}</p>
      {/if}
    {/if}
  </div>
{/if}

<style>
  .ai-result {
    flex-shrink: 0;
    border-top: 1px solid var(--border);
    background: var(--surface);
    animation: slideUp 0.2s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .ai-loading {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    font-size: 12px;
    color: var(--text-3);
  }

  .ai-spinner {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
    border: 1.5px solid var(--text-3);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .ai-toggle {
    all: unset;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 11px 20px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-3);
    cursor: pointer;
    transition: color 0.12s;
  }

  .ai-toggle:hover {
    color: var(--text-2);
  }

  .ai-chevron {
    display: inline-block;
    font-size: 16px;
    transition: transform 0.18s ease;
  }

  .ai-chevron.open {
    transform: rotate(90deg);
  }

  .ai-text {
    padding: 0 20px 14px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--text-2);
  }
</style>
