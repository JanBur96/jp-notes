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
    max-width: 360px;
    margin-right: auto;
  }

  .search-input {
    width: 100%;
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: 20px;
    outline: none;
    background: var(--surface-2);
    font-family: inherit;
    font-size: 12px;
    color: var(--text);
    transition:
      border-color 0.12s,
      background 0.12s;
  }

  .search-input::placeholder {
    color: var(--text-3);
  }

  .search-input:focus {
    border-color: rgba(192, 144, 48, 0.32);
    background: var(--surface-3);
  }

  .search-results {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 60;
    max-height: 360px;
    overflow-y: auto;
    list-style: none;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-2);
    box-shadow:
      0 18px 48px rgba(0, 0, 0, 0.55),
      0 4px 12px rgba(0, 0, 0, 0.35);
  }

  .search-result-btn {
    all: unset;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 9px 14px;
    cursor: pointer;
  }

  .search-results li.active .search-result-btn {
    background: var(--accent-dim);
  }

  .search-result-title {
    overflow: hidden;
    font-size: 13px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text);
  }

  .search-result-folder {
    font-size: 11px;
    color: var(--text-3);
  }

  .search-empty {
    padding: 12px 14px;
    font-size: 12px;
    font-style: italic;
    color: var(--text-3);
  }

  @media (max-width: 600px) {
    .toolbar-search {
      display: none;
    }
  }
</style>
