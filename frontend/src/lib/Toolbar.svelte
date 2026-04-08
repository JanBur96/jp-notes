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

<div class="toolbar">
  <button
    class="toolbar-btn mobile-back"
    class:hidden={store.mobilePane === 'sidebar'}
    onclick={onBack}
    aria-label="Back">←</button
  >
  <span class="toolbar-title">JP<em>Notes</em></span>
  <ToolbarSearch bind:this={searchRef} />
  <button class="toolbar-btn primary" onclick={onNewNote}>New Note</button>
  <button class="toolbar-btn" onclick={onNewFolder}>New Folder</button>
</div>

<style>
  .toolbar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 6px;
    height: 44px;
    padding: 0 20px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }

  .toolbar-title {
    margin-right: 16px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  .toolbar-title em {
    font-family: 'Lora', Georgia, serif;
    font-style: italic;
    font-weight: 500;
    letter-spacing: 0;
    color: var(--accent);
  }

  .mobile-back {
    display: none;
    margin-right: 4px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 16px;
  }

  .mobile-back.hidden {
    visibility: hidden;
    pointer-events: none;
  }

  @media (max-width: 600px) {
    .toolbar {
      gap: 6px;
      padding: 0 12px;
    }

    .toolbar-title {
      flex: 1;
      margin-right: 0;
      text-align: center;
    }

    .mobile-back {
      display: block;
    }
  }
</style>
