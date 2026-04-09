<script lang="ts">
  import { store } from './store.svelte';

  let showSummary = $state(false);

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
        <span>Generating summary…</span>
      </div>
    {:else}
      <button
        class="ai-toggle"
        onclick={() => (showSummary = !showSummary)}
        aria-expanded={showSummary}
      >
        <span class="ai-toggle-label">
          <span class="ai-toggle-dot"></span>
          AI Summary
        </span>
        <span class="ai-chevron" class:open={showSummary}>
          <svg viewBox="0 0 10 10" width="10" height="10" fill="none">
            <path d="M2 4l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
      {#if showSummary}
        <p class="ai-text">{store.aiSummary}</p>
      {/if}
    {/if}
  </div>
{/if}

<style>
  .ai-result {
    position: relative;
    flex-shrink: 0;
    border-top: 1px solid var(--border);
    background:
      linear-gradient(180deg, rgba(18, 28, 48, 0.5), rgba(10, 18, 32, 0.4));
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    animation: slideUp 0.24s var(--ease);
  }

  .ai-result::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(228, 178, 89, 0.32) 50%,
      transparent
    );
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .ai-loading {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 24px;
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 13px;
    color: var(--text-2);
  }

  .ai-spinner {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    border: 1.5px solid rgba(228, 178, 89, 0.2);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    box-shadow: 0 0 10px rgba(228, 178, 89, 0.25);
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
    padding: 12px 24px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-3);
    cursor: pointer;
    transition: color var(--dur) var(--ease);
  }

  .ai-toggle:hover {
    color: var(--accent);
  }

  .ai-toggle-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .ai-toggle-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: linear-gradient(180deg, #f1c774, #c89040);
    box-shadow: 0 0 8px rgba(228, 178, 89, 0.6);
  }

  .ai-chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-3);
    transition: transform 0.22s var(--ease), color var(--dur) var(--ease);
  }

  .ai-toggle:hover .ai-chevron {
    color: var(--accent);
  }

  .ai-chevron.open {
    transform: rotate(-180deg);
  }

  .ai-text {
    padding: 0 24px 18px;
    font-family: 'Lora', Georgia, serif;
    font-size: 14px;
    font-style: italic;
    line-height: 1.75;
    color: var(--text);
    animation: textIn 0.22s var(--ease);
  }

  @keyframes textIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
