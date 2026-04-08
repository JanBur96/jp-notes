<script lang="ts">
  import { store } from './store.svelte';
  import { api, type Note } from './api';

  let query = $state('');
  let results = $state<Note[]>([]);
  let open = $state(false);
  let selectedIndex = $state(0);
  let inputEl: HTMLInputElement;

  export function focus() {
    inputEl?.focus();
    inputEl?.select();
  }

  $effect(() => {
    const q = query.trim();
    if (q === '') {
      results = [];
      open = false;
      return;
    }

    const handle = window.setTimeout(async () => {
      try {
        const found = await api.notes.list({ search: q });
        results = found.slice(0, 8);
        selectedIndex = 0;
        open = true;
      } catch (err) {
        console.error('Search failed:', err);
      }
    }, 200);

    return () => clearTimeout(handle);
  });

  function reset() {
    query = '';
    results = [];
    open = false;
    selectedIndex = 0;
  }

  function selectResult(note: Note) {
    // Make sure the note is visible in the current list before activating it
    if (!store.notes.find((n) => n.id === note.id)) {
      store.notes = [...store.notes, note];
    }
    if (store.activeFolderId !== note.folderId) {
      store.activeFolderId = note.folderId;
    }
    if (store.archiveMode) store.archiveMode = false;
    store.activeNoteId = note.id;
    store.mobilePane = 'editor';
    reset();
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      reset();
      return;
    }
    if (!open || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % results.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + results.length) % results.length;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const note = results[selectedIndex];
      if (note) selectResult(note);
    }
  }

  function onWindowClick(e: MouseEvent) {
    const target = e.target as HTMLElement | null;
    if (!target?.closest?.('.toolbar-search')) {
      open = false;
    }
  }
</script>

<svelte:window onclick={onWindowClick} />

<div class="toolbar-search">
  <svg class="search-icon" viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.4"/>
    <path d="M10.5 10.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </svg>
  <input
    bind:this={inputEl}
    type="text"
    class="search-input"
    placeholder="Search notes…"
    bind:value={query}
    onfocus={() => {
      if (results.length > 0) open = true;
    }}
    onkeydown={onKeydown}
  />
  <kbd class="search-hint">⌃⌥K</kbd>
  {#if open && results.length > 0}
    <ul class="search-results">
      {#each results as note, i (note.id)}
        <li class:active={i === selectedIndex}>
          <button
            type="button"
            class="search-result-btn"
            onmouseenter={() => (selectedIndex = i)}
            onclick={() => selectResult(note)}
          >
            <span class="search-result-title">
              {note.title || 'Untitled'}
            </span>
            <span class="search-result-folder">
              {note.folder?.name ?? 'All Notes'}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  {:else if open && query.trim() !== ''}
    <ul class="search-results">
      <li class="search-empty">No matches</li>
    </ul>
  {/if}
</div>

<style>
  .toolbar-search {
    position: relative;
    flex: 1;
    max-width: 420px;
    margin-right: auto;
  }

  .search-icon {
    position: absolute;
    top: 50%;
    left: 14px;
    transform: translateY(-50%);
    color: var(--text-3);
    pointer-events: none;
    transition: color var(--dur) var(--ease);
  }

  .search-input {
    width: 100%;
    padding: 8px 62px 8px 36px;
    border: 1px solid var(--border-hi);
    border-radius: var(--radius-pill);
    outline: none;
    background: rgba(12, 20, 36, 0.55);
    font-family: inherit;
    font-size: 12.5px;
    color: var(--text);
    transition:
      border-color var(--dur) var(--ease),
      background var(--dur) var(--ease),
      box-shadow var(--dur) var(--ease);
  }

  .search-input::placeholder {
    color: var(--text-3);
  }

  .search-input:focus {
    border-color: rgba(228, 178, 89, 0.45);
    background: rgba(18, 28, 48, 0.75);
    box-shadow:
      0 0 0 3px rgba(228, 178, 89, 0.1),
      0 4px 20px -4px rgba(228, 178, 89, 0.2);
  }

  .toolbar-search:focus-within .search-icon {
    color: var(--accent);
  }

  .search-hint {
    position: absolute;
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
    padding: 2px 7px;
    border: 1px solid var(--border-hi);
    border-radius: 5px;
    background: rgba(20, 30, 50, 0.5);
    font-family: inherit;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--text-3);
    pointer-events: none;
  }

  .toolbar-search:focus-within .search-hint {
    opacity: 0.4;
  }

  .search-results {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    z-index: 60;
    max-height: 380px;
    overflow-y: auto;
    list-style: none;
    padding: 6px;
    border: 1px solid rgba(140, 180, 240, 0.16);
    border-radius: 12px;
    background:
      linear-gradient(180deg, rgba(22, 32, 52, 0.96), rgba(12, 20, 36, 0.96));
    backdrop-filter: blur(20px) saturate(140%);
    -webkit-backdrop-filter: blur(20px) saturate(140%);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 22px 56px rgba(0, 0, 0, 0.6),
      0 4px 14px rgba(0, 0, 0, 0.4);
    animation: dropdownIn 0.16s var(--ease);
  }

  @keyframes dropdownIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .search-result-btn {
    all: unset;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 3px;
    width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background var(--dur) var(--ease);
  }

  .search-results li.active .search-result-btn {
    background: linear-gradient(
      90deg,
      rgba(228, 178, 89, 0.18),
      rgba(228, 178, 89, 0.04)
    );
    box-shadow: inset 0 1px 0 rgba(255, 220, 150, 0.08);
  }

  .search-result-title {
    overflow: hidden;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.005em;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text);
  }

  .search-result-folder {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 11px;
    color: var(--text-3);
  }

  .search-results li.active .search-result-folder {
    color: var(--accent);
  }

  .search-empty {
    padding: 14px 14px;
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-size: 12px;
    text-align: center;
    color: var(--text-3);
  }

  @media (max-width: 600px) {
    .toolbar-search {
      display: none;
    }
  }
</style>
