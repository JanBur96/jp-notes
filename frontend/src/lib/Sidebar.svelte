<script lang="ts">
  import FolderTree from './FolderTree.svelte';
  import {
    store,
    moveNoteToFolder,
    moveFolderToParent,
    download,
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

<aside class="pane-sidebar">
  <div>
    <div class="section-label">
      <span class="label-dot"></span>
      Library
    </div>

    <ul class="folder-tree">
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <li>
        <span
          class="nav-entry"
          class:active={store.activeFolderId === null &&
            store.archiveMode === false}
          class:drop-target={allNotesDragOver}
          onclick={selectAllNotes}
          ondragover={handleAllNotesDragOver}
          ondragleave={() => (allNotesDragOver = false)}
          ondrop={handleAllNotesDrop}
        >
          <svg
            class="nav-icon"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 4c0-.55.45-1 1-1h8c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V4z"
              stroke="currentColor"
              stroke-width="1.2"
            />
            <path
              d="M5.5 6.5h5M5.5 9h5M5.5 11.5h3"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
            />
          </svg>
          <span>All Notes</span>
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
        <span
          class="nav-entry"
          class:active={store.archiveMode}
          onclick={selectArchive}
        >
          <svg
            class="nav-icon"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2.5 4c0-.55.45-1 1-1h9c.55 0 1 .45 1 1v1.5c0 .55-.45 1-1 1h-9c-.55 0-1-.45-1-1V4z"
              stroke="currentColor"
              stroke-width="1.2"
            />
            <path
              d="M3.5 6.5v5.5c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V6.5M6.5 9h3"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
            />
          </svg>
          <span>Archive</span>
        </span>
      </li>
    </ul>
  </div>
  <div class="export">
    <button class="export-button" onclick={() => download()}>
      Export Notes
    </button>
  </div>
</aside>

<style>
  .pane-sidebar {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    flex-shrink: 0;
    flex-direction: column;
    width: 220px;
    min-width: 140px;
    overflow-y: auto;
    padding: 22px 0 16px;
    border-right: 1px solid var(--border);
    background: linear-gradient(
      180deg,
      rgba(15, 24, 42, 0.55),
      rgba(8, 14, 26, 0.35)
    );
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  .section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 22px 14px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .label-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: linear-gradient(180deg, #f1c774, #c89040);
    box-shadow: 0 0 8px rgba(228, 178, 89, 0.5);
  }

  .folder-tree {
    list-style: none;
    padding: 0 10px 12px;
  }

  .folder-tree :global(li) {
    user-select: none;
  }

  .nav-entry,
  .folder-tree :global(button),
  .folder-tree :global(details > summary) {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 12px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: none;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-2);
    cursor: pointer;
    transition:
      background var(--dur) var(--ease),
      border-color var(--dur) var(--ease),
      color var(--dur) var(--ease),
      box-shadow var(--dur) var(--ease);
  }

  .nav-entry:hover,
  .folder-tree :global(button:hover),
  .folder-tree :global(details > summary:hover) {
    background: rgba(140, 180, 240, 0.05);
    color: var(--text);
  }

  .nav-entry.active,
  .folder-tree :global(button.active),
  .folder-tree :global(summary.active) {
    border-color: rgba(228, 178, 89, 0.3);
    background: linear-gradient(
      90deg,
      rgba(228, 178, 89, 0.18),
      rgba(228, 178, 89, 0.04)
    );
    color: var(--text);
    box-shadow:
      inset 0 1px 0 rgba(255, 220, 150, 0.08),
      0 2px 16px -6px rgba(228, 178, 89, 0.3);
  }

  .nav-entry.active::before,
  .folder-tree :global(button.active::before),
  .folder-tree :global(summary.active::before) {
    content: '';
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 18px;
    border-radius: 0 3px 3px 0;
    background: linear-gradient(180deg, #f1c774, #c89040);
    box-shadow: 0 0 10px rgba(228, 178, 89, 0.6);
  }

  .nav-icon {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    color: var(--text-3);
    transition: color var(--dur) var(--ease);
  }

  .nav-entry:hover .nav-icon,
  .nav-entry.active .nav-icon {
    color: var(--accent);
  }

  .folder-tree :global(details > summary) {
    list-style: none;
  }

  .folder-tree :global(details > summary::-webkit-details-marker) {
    display: none;
  }

  .folder-tree :global(details > summary::after) {
    content: '';
    display: inline-block;
    margin-left: auto;
    width: 6px;
    height: 6px;
    border-right: 1.5px solid var(--text-3);
    border-bottom: 1.5px solid var(--text-3);
    transform: rotate(-45deg);
    transition: transform 0.2s var(--ease);
  }

  .folder-tree :global(details[open] > summary::after) {
    transform: rotate(45deg);
  }

  .folder-tree :global(details > summary:hover::after),
  .folder-tree :global(details > summary.active::after) {
    border-color: var(--accent);
  }

  .folder-tree :global(ul) {
    list-style: none;
    padding-left: 16px;
    margin-top: 2px;
  }

  .nav-entry.drop-target,
  .folder-tree :global(button.drop-target),
  .folder-tree :global(summary.drop-target) {
    border-color: var(--accent);
    background: rgba(228, 178, 89, 0.2);
    color: var(--text);
    outline: 1px dashed var(--accent);
    outline-offset: -2px;
    box-shadow: 0 0 18px -4px rgba(228, 178, 89, 0.45);
  }

  .folder-tree :global(button.dragging),
  .folder-tree :global(summary.dragging) {
    opacity: 0.5;
  }

  .export {
    padding: 0 12px;
  }

  .export-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border: 1px solid var(--border-hi);
    border-radius: var(--radius-pill);
    background: rgba(20, 30, 50, 0.4);
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.01em;
    white-space: nowrap;
    color: var(--text-2);
    cursor: pointer;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition:
      background var(--dur) var(--ease),
      border-color var(--dur) var(--ease),
      color var(--dur) var(--ease),
      box-shadow var(--dur) var(--ease),
      transform var(--dur) var(--ease);
  }

  .export-button:hover {
    border-color: rgba(140, 180, 240, 0.22);
    background: rgba(30, 45, 72, 0.6);
    color: var(--text);
  }

  @media (max-width: 860px) {
    .pane-sidebar {
      width: 200px;
      min-width: 200px;
    }
  }

  @media (max-width: 600px) {
    .pane-sidebar {
      width: 100%;
      min-width: 0;
      border-right: none;
    }
  }
</style>
