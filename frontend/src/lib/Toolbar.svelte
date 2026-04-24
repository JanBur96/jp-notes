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
    class={[
      'toolbar-btn',
      'toolbar__back',
      store.mobilePane === 'sidebar' && 'toolbar__back--hidden',
    ]}
    onclick={onBack}
    aria-label="Back">←</button
  >

  <div class="toolbar__panel-toggles">
    <button
      class="toolbar__panel-toggle"
      aria-pressed={store.showFolderTree}
      aria-label="Toggle folder tree"
      title="Toggle folder tree (Ctrl+Alt+1)"
      onclick={() => (store.showFolderTree = !store.showFolderTree)}
    >
      <svg
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="2"
          y="3.5"
          width="12"
          height="9"
          rx="1.4"
          stroke="currentColor"
          stroke-width="1.3"
        />
        <path
          d="M2.6 4.2h3.4v7.6H2.6z"
          fill="currentColor"
          fill-opacity="0.38"
        />
        <line
          x1="6"
          y1="3.5"
          x2="6"
          y2="12.5"
          stroke="currentColor"
          stroke-width="1.3"
        />
      </svg>
    </button>
    <button
      class="toolbar__panel-toggle"
      aria-pressed={store.showNoteList}
      aria-label="Toggle note list"
      title="Toggle note list (Ctrl+Alt+2)"
      onclick={() => (store.showNoteList = !store.showNoteList)}
    >
      <svg
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="2"
          y="3.5"
          width="12"
          height="9"
          rx="1.4"
          stroke="currentColor"
          stroke-width="1.3"
        />
        <path
          d="M6.2 4.2h3.6v7.6H6.2z"
          fill="currentColor"
          fill-opacity="0.38"
        />
        <line
          x1="6"
          y1="3.5"
          x2="6"
          y2="12.5"
          stroke="currentColor"
          stroke-width="1.3"
        />
        <line
          x1="10"
          y1="3.5"
          x2="10"
          y2="12.5"
          stroke="currentColor"
          stroke-width="1.3"
        />
      </svg>
    </button>
  </div>

  <div class="toolbar__brand" aria-label="JPNotes">
    <span class="toolbar__brand-mark" aria-hidden="true">
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
    <span class="toolbar__brand-text">
      <span class="toolbar__brand-jp">JP</span><em class="toolbar__brand-notes"
        >Notes</em
      >
    </span>
  </div>

  <ToolbarSearch bind:this={searchRef} />

  <div class="toolbar__actions">
    <button class="toolbar-btn toolbar-btn--primary" onclick={onNewNote}>
      <svg
        viewBox="0 0 16 16"
        width="12"
        height="12"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 3.5v9M3.5 8h9"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
      New Note
    </button>
    <button class="toolbar-btn" onclick={onNewFolder}>
      <svg
        viewBox="0 0 16 16"
        width="12"
        height="12"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 5c0-.55.45-1 1-1h3.17c.26 0 .52.1.7.29l.92.92c.19.19.44.29.71.29H13c.55 0 1 .45 1 1v6c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1V5z"
          stroke="currentColor"
          stroke-width="1.3"
          stroke-linejoin="round"
        />
      </svg>
      Folder
    </button>
    <button
      class="toolbar__help"
      aria-label="Keyboard shortcuts"
      title="Keyboard shortcuts (Ctrl+Alt+/)"
      onclick={() => (store.modal = { kind: 'help' })}
    >
      <svg
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="8"
          cy="8"
          r="6.2"
          stroke="currentColor"
          stroke-width="1.3"
        />
        <path
          d="M6 6.3c0-1.1.9-2 2-2s2 .9 2 2c0 .9-.6 1.35-1.2 1.7-.5.3-.8.55-.8 1.2"
          stroke="currentColor"
          stroke-width="1.3"
          stroke-linecap="round"
        />
        <circle cx="8" cy="11.6" r="0.7" fill="currentColor" />
      </svg>
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
    background: linear-gradient(
      180deg,
      rgba(18, 28, 48, 0.7),
      rgba(10, 18, 32, 0.55)
    );
    backdrop-filter: blur(18px) saturate(140%);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
  }

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

  .toolbar__panel-toggles {
    display: flex;
    align-items: center;
    gap: 4px;
    padding-right: 10px;
    margin-right: 2px;
    border-right: 1px solid var(--border);
  }

  .toolbar__panel-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 7px;
    background: transparent;
    color: var(--text-2);
    cursor: pointer;
    transition:
      background var(--dur) var(--ease),
      border-color var(--dur) var(--ease),
      color var(--dur) var(--ease);
  }

  .toolbar__panel-toggle:hover {
    border-color: var(--border-hi);
    background: rgba(30, 45, 72, 0.55);
    color: var(--text);
  }

  .toolbar__panel-toggle[aria-pressed='true'] {
    border-color: rgba(228, 178, 89, 0.32);
    background: rgba(228, 178, 89, 0.1);
    color: var(--accent-hi);
  }

  .toolbar__panel-toggle[aria-pressed='true']:hover {
    border-color: rgba(228, 178, 89, 0.48);
    background: rgba(228, 178, 89, 0.16);
  }

  .toolbar__brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-right: 18px;
    user-select: none;
  }

  .toolbar__brand-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: 1px solid rgba(228, 178, 89, 0.22);
    border-radius: 8px;
    background: radial-gradient(
        circle at 30% 20%,
        rgba(241, 199, 116, 0.18),
        transparent 70%
      ),
      linear-gradient(180deg, rgba(30, 40, 64, 0.8), rgba(15, 22, 38, 0.8));
    box-shadow:
      inset 0 1px 0 rgba(255, 220, 150, 0.08),
      0 4px 14px -6px rgba(228, 178, 89, 0.35);
  }

  .toolbar__brand-text {
    display: inline-flex;
    align-items: baseline;
    font-size: 16px;
    letter-spacing: -0.025em;
  }

  .toolbar__brand-jp {
    font-weight: 700;
    color: var(--text);
  }

  .toolbar__brand-notes {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-weight: 600;
    letter-spacing: -0.01em;
    background: linear-gradient(180deg, #f1c774, #c89040);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .toolbar__actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toolbar__help {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    margin-left: 2px;
    border: 1px solid transparent;
    border-radius: 7px;
    background: transparent;
    color: var(--text-3);
    cursor: pointer;
    transition:
      background var(--dur) var(--ease),
      border-color var(--dur) var(--ease),
      color var(--dur) var(--ease);
  }

  .toolbar__help:hover {
    border-color: var(--border-hi);
    background: rgba(30, 45, 72, 0.55);
    color: var(--text);
  }

  .toolbar__back {
    display: none;
    width: 34px;
    padding: 6px 0;
    justify-content: center;
    font-size: 16px;
  }

  .toolbar__back--hidden {
    visibility: hidden;
    pointer-events: none;
  }

  @media (max-width: 860px) {
    .toolbar {
      gap: 10px;
      height: 50px;
      padding: 0 16px;
    }
    .toolbar__brand {
      margin-right: 8px;
    }
    .toolbar__brand-text {
      font-size: 15px;
    }
  }

  @media (max-width: 600px) {
    .toolbar {
      gap: 8px;
      padding: 0 12px;
    }
    .toolbar__brand {
      flex: 1;
      justify-content: center;
      margin-right: 0;
    }
    .toolbar__back {
      display: flex;
    }
    .toolbar__panel-toggles {
      display: none;
    }
  }
</style>
