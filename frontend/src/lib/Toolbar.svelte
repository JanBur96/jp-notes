<script lang="ts">
  import { store } from './store.svelte';
  import ToolbarSearch from './ToolbarSearch.svelte';

  interface Props {
    onNewNote: () => void;
    onNewFolder: () => void;
    onBack: () => void;
  }

  const { onNewNote, onNewFolder, onBack }: Props = $props();

  let searchRef: ToolbarSearch;

  export function focusSearch() {
    searchRef?.focus();
  }
</script>

<header class="toolbar">
  <button
    class="toolbar-btn mobile-back"
    class:hidden={store.mobilePane === 'sidebar'}
    onclick={onBack}
    aria-label="Back">←</button
  >

  <div class="brand" aria-label="JPNotes">
    <span class="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path
          d="M6 4.5c0-.83.67-1.5 1.5-1.5h7.2c.4 0 .78.16 1.06.44l3.8 3.8c.28.28.44.66.44 1.06V19.5c0 .83-.67 1.5-1.5 1.5h-11c-.83 0-1.5-.67-1.5-1.5v-15z"
          stroke="url(#brandStroke)"
          stroke-width="1.4"
          stroke-linejoin="round"
        />
        <path
          d="M14.5 3.5v4a1 1 0 001 1h4"
          stroke="url(#brandStroke)"
          stroke-width="1.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M9 12h6M9 15h6M9 9h3"
          stroke="url(#brandStroke)"
          stroke-width="1.4"
          stroke-linecap="round"
        />
        <defs>
          <linearGradient id="brandStroke" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0" stop-color="#f1c774" />
            <stop offset="1" stop-color="#c89040" />
          </linearGradient>
        </defs>
      </svg>
    </span>
    <span class="brand-text">
      <span class="brand-jp">JP</span><em class="brand-notes">Notes</em>
    </span>
  </div>

  <ToolbarSearch bind:this={searchRef} />

  <div class="toolbar-actions">
    <button class="toolbar-btn primary" onclick={onNewNote}>
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
        <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
      New Note
    </button>
    <button class="toolbar-btn" onclick={onNewFolder}>
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
        <path
          d="M2 5c0-.55.45-1 1-1h3.17c.26 0 .52.1.7.29l.92.92c.19.19.44.29.71.29H13c.55 0 1 .45 1 1v6c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1V5z"
          stroke="currentColor"
          stroke-width="1.3"
          stroke-linejoin="round"
        />
      </svg>
      Folder
    </button>
  </div>
</header>

<style>
  .toolbar {
    position: relative;
    z-index: 2;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 12px;
    height: 54px;
    padding: 0 22px;
    border-bottom: 1px solid var(--border);
    background:
      linear-gradient(
        180deg,
        rgba(18, 28, 48, 0.7),
        rgba(10, 18, 32, 0.55)
      );
    backdrop-filter: blur(18px) saturate(140%);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
  }

  /* A hair of gold bleeds along the bottom edge — this is the signature
     accent stripe that ties the header to the gaslight motif. */
  .toolbar::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(228, 178, 89, 0.28) 30%,
      rgba(228, 178, 89, 0.35) 50%,
      rgba(228, 178, 89, 0.28) 70%,
      transparent
    );
    pointer-events: none;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-right: 18px;
    user-select: none;
  }

  .brand-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: 1px solid rgba(228, 178, 89, 0.22);
    border-radius: 8px;
    background:
      radial-gradient(circle at 30% 20%, rgba(241, 199, 116, 0.18), transparent 70%),
      linear-gradient(180deg, rgba(30, 40, 64, 0.8), rgba(15, 22, 38, 0.8));
    box-shadow:
      inset 0 1px 0 rgba(255, 220, 150, 0.08),
      0 4px 14px -6px rgba(228, 178, 89, 0.35);
  }

  .brand-text {
    display: inline-flex;
    align-items: baseline;
    font-size: 16px;
    letter-spacing: -0.025em;
  }

  .brand-jp {
    font-weight: 700;
    color: var(--text);
  }

  .brand-notes {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-weight: 600;
    letter-spacing: -0.01em;
    background: linear-gradient(180deg, #f1c774, #c89040);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mobile-back {
    display: none;
    width: 34px;
    padding: 6px 0;
    justify-content: center;
    font-size: 16px;
  }

  .mobile-back.hidden {
    visibility: hidden;
    pointer-events: none;
  }

  @media (max-width: 860px) {
    .toolbar {
      gap: 10px;
      height: 50px;
      padding: 0 16px;
    }
    .brand {
      margin-right: 8px;
    }
    .brand-text {
      font-size: 15px;
    }
  }

  @media (max-width: 600px) {
    .toolbar {
      gap: 8px;
      padding: 0 12px;
    }
    .brand {
      flex: 1;
      justify-content: center;
      margin-right: 0;
    }
    .mobile-back {
      display: flex;
    }
  }
</style>
