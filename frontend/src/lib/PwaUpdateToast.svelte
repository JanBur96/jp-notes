<script lang="ts">
  import { onMount } from 'svelte';

  let needRefresh = $state(false);
  let offlineReady = $state(false);
  let updateSW: ((reload?: boolean) => Promise<void>) | null = null;
  let offlineToastTimer: number | null = null;

  onMount(() => {
    void import('virtual:pwa-register').then(({ registerSW }) => {
      updateSW = registerSW({
        onNeedRefresh() {
          needRefresh = true;
        },
        onOfflineReady() {
          offlineReady = true;
          offlineToastTimer = window.setTimeout(() => {
            offlineReady = false;
          }, 3500);
        },
      });
    });
  });

  $effect(() => {
    return () => {
      if (offlineToastTimer !== null) clearTimeout(offlineToastTimer);
    };
  });

  async function applyUpdate() {
    needRefresh = false;
    await updateSW?.(true);
  }

  function dismissRefresh() {
    needRefresh = false;
  }

  function dismissOfflineReady() {
    if (offlineToastTimer !== null) clearTimeout(offlineToastTimer);
    offlineReady = false;
  }
</script>

{#if needRefresh}
  <div class="pwa-toast" role="status" aria-live="polite">
    <span class="pwa-toast__text">New version available.</span>
    <div class="pwa-toast__actions">
      <button class="pwa-toast__btn" onclick={dismissRefresh}>Later</button>
      <button
        class="pwa-toast__btn pwa-toast__btn--primary"
        onclick={applyUpdate}
      >
        Reload
      </button>
    </div>
  </div>
{:else if offlineReady}
  <div class="pwa-toast" role="status" aria-live="polite">
    <span class="pwa-toast__text">Ready to work offline.</span>
    <button class="pwa-toast__btn" onclick={dismissOfflineReady}>OK</button>
  </div>
{/if}

<style>
  .pwa-toast {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 200;
    display: flex;
    align-items: center;
    gap: 14px;
    max-width: calc(100vw - 40px);
    padding: 12px 16px;
    border: 1px solid rgba(140, 180, 240, 0.18);
    border-radius: 12px;
    background: linear-gradient(
      180deg,
      rgba(22, 32, 52, 0.94),
      rgba(12, 20, 36, 0.94)
    );
    backdrop-filter: blur(18px) saturate(140%);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 16px 48px -16px rgba(0, 0, 0, 0.6);
    color: var(--text);
    font-size: 13px;
    animation: pwaToastIn 0.22s var(--ease);
  }

  @keyframes pwaToastIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .pwa-toast__text {
    color: var(--text-2);
  }

  .pwa-toast__actions {
    display: flex;
    gap: 6px;
  }

  .pwa-toast__btn {
    padding: 5px 12px;
    border: 1px solid var(--border-hi);
    border-radius: 7px;
    background: rgba(20, 30, 50, 0.5);
    font-family: inherit;
    font-size: 12px;
    color: var(--text-2);
    cursor: pointer;
    transition:
      background var(--dur) var(--ease),
      border-color var(--dur) var(--ease),
      color var(--dur) var(--ease);
  }

  .pwa-toast__btn:hover {
    border-color: rgba(140, 180, 240, 0.22);
    background: rgba(30, 45, 72, 0.7);
    color: var(--text);
  }

  .pwa-toast__btn--primary {
    border-color: rgba(228, 178, 89, 0.38);
    background: linear-gradient(
      180deg,
      rgba(228, 178, 89, 0.2),
      rgba(200, 150, 60, 0.12)
    );
    color: var(--accent-hi);
  }

  .pwa-toast__btn--primary:hover {
    border-color: rgba(228, 178, 89, 0.55);
    background: linear-gradient(
      180deg,
      rgba(240, 190, 100, 0.28),
      rgba(210, 160, 70, 0.18)
    );
    color: #ffe3a8;
  }
</style>
