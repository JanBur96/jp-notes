<script lang="ts">
  import FolderTree from './FolderTree.svelte';
  import { store } from './store.svelte';

  function selectFolder(id: string) {
    store.activeFolderId = id;
    store.mobilePane = 'list';
    if (store.archiveMode) {
      store.archiveMode = false;
    }
  }

  function selectAllNotes() {
    store.activeFolderId = null;
    store.mobilePane = 'list';
    if (store.archiveMode) {
      store.archiveMode = false;
    }
  }

  function selectArchive() {
    store.activeFolderId = null;
    store.archiveMode = true;
    store.mobilePane = 'list';
  }
</script>

<div class="pane-sidebar">
  <div class="section-label">Folders</div>

  <ul class="folder-tree">
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <li>
      <span
        class:active={store.activeFolderId === null &&
          store.archiveMode === false}
        onclick={selectAllNotes}
      >
        All Notes
      </span>
    </li>
    <li>
      <ul>
        <FolderTree
          folders={store.folders}
          parentId={null}
          activeFolderId={store.activeFolderId}
          onSelect={selectFolder}
        />
      </ul>
    </li>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <li>
      <span class:active={store.archiveMode} onclick={selectArchive}
        >Archive</span
      >
    </li>
  </ul>
</div>

<style>
  .pane-sidebar {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    width: 200px;
    min-width: 120px;
    overflow-y: auto;
    padding: 16px 0 12px;
    border-right: 1px solid var(--border);
    background: var(--surface);
  }

  .section-label {
    padding: 0 16px 10px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  /* ── Folder tree ───────────────────────────────────────── */

  .folder-tree {
    list-style: none;
    padding: 0 0 12px;
  }

  .folder-tree :global(li) {
    user-select: none;
  }

  /* Leaf folder buttons (rendered by FolderTree.svelte) */
  .folder-tree :global(button) {
    display: flex;
    width: 100%;
    padding: 5px 16px 5px 26px;
    border: none;
    border-left: 2px solid transparent;
    background: none;
    font-size: 13px;
    color: var(--text-2);
    cursor: pointer;
    transition:
      background 0.1s,
      border-color 0.1s,
      color 0.1s;
  }

  .folder-tree :global(button:hover) {
    background: rgba(130, 170, 230, 0.05);
    color: var(--text);
  }

  .folder-tree :global(button.active) {
    border-left-color: var(--accent);
    background: var(--accent-dim);
    color: var(--text);
  }

  /* Parent folder summaries (rendered by FolderTree.svelte) */
  .folder-tree :global(details > summary) {
    display: flex;
    list-style: none;
    align-items: center;
    gap: 6px;
    padding: 5px 16px;
    border-left: 2px solid transparent;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-2);
    cursor: pointer;
    transition:
      background 0.1s,
      color 0.1s;
  }

  .folder-tree :global(details > summary::-webkit-details-marker) {
    display: none;
  }

  .folder-tree :global(details > summary::before) {
    content: '›';
    display: inline-block;
    width: 10px;
    font-size: 14px;
    color: var(--text-3);
    transition: transform 0.15s;
  }

  .folder-tree :global(details[open] > summary::before) {
    transform: rotate(90deg);
  }

  .folder-tree :global(details > summary:hover) {
    background: rgba(130, 170, 230, 0.05);
    color: var(--text);
  }

  .folder-tree :global(summary.active) {
    border-left-color: var(--accent);
    background: var(--accent-dim);
    color: var(--text);
  }

  /* Nested folder lists (rendered by FolderTree.svelte) */
  .folder-tree :global(ul) {
    list-style: none;
    padding-left: 16px;
  }

  /* All Notes / Archive spans (in this component's own template) */
  .folder-tree li > span {
    display: block;
    padding: 5px 16px 5px 18px;
    border-left: 2px solid transparent;
    font-size: 13px;
    color: var(--text-2);
    cursor: pointer;
    transition:
      background 0.1s,
      border-color 0.1s,
      color 0.1s;
  }

  .folder-tree li > span:hover {
    background: rgba(130, 170, 230, 0.05);
    color: var(--text);
  }

  .folder-tree li > span.active {
    border-left-color: var(--accent);
    background: var(--accent-dim);
    color: var(--text);
  }

  /* ── Responsive ────────────────────────────────────────── */

  @media (max-width: 860px) {
    .pane-sidebar { width: 180px; min-width: 180px; }
  }

  @media (max-width: 600px) {
    .pane-sidebar { width: 100%; min-width: 0; border-right: none; }
  }
</style>
