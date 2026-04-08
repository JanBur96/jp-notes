<script lang="ts">
  import FolderTree from './FolderTree.svelte';
  import {
    store,
    moveNoteToFolder,
    moveFolderToParent,
  } from './store.svelte';

  let allNotesDragOver = $state(false);

  async function handleDropNote(folderId: string | null) {
    const id =
      store.draggingItem?.kind === 'note' ? store.draggingItem.id : null;
    store.draggingItem = null;
    if (!id || store.archiveMode) return;
    await moveNoteToFolder(id, folderId);
  }

  async function handleDropFolder(parentId: string | null) {
    const id =
      store.draggingItem?.kind === 'folder' ? store.draggingItem.id : null;
    store.draggingItem = null;
    if (!id) return;
    await moveFolderToParent(id, parentId);
  }

  function handleAllNotesDragOver(e: DragEvent) {
    if (!store.draggingItem) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    allNotesDragOver = true;
  }

  function handleAllNotesDrop(e: DragEvent) {
    e.preventDefault();
    allNotesDragOver = false;
    const item = store.draggingItem;
    if (!item) return;
    if (item.kind === 'note') handleDropNote(null);
    else handleDropFolder(null);
  }

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
        class:drop-target={allNotesDragOver}
        onclick={selectAllNotes}
        ondragover={handleAllNotesDragOver}
        ondragleave={() => (allNotesDragOver = false)}
        ondrop={handleAllNotesDrop}
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
          onDropNote={handleDropNote}
          onDropFolder={handleDropFolder}
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

  .folder-tree li > span.drop-target,
  .folder-tree :global(button.drop-target),
  .folder-tree :global(summary.drop-target) {
    border-left-color: var(--accent);
    background: rgba(192, 144, 48, 0.18);
    color: var(--text);
    outline: 1px dashed var(--accent);
    outline-offset: -2px;
  }

  .folder-tree :global(button.dragging),
  .folder-tree :global(summary.dragging) {
    opacity: 0.5;
  }

  /* ── Responsive ────────────────────────────────────────── */

  @media (max-width: 860px) {
    .pane-sidebar { width: 180px; min-width: 180px; }
  }

  @media (max-width: 600px) {
    .pane-sidebar { width: 100%; min-width: 0; border-right: none; }
  }
</style>
