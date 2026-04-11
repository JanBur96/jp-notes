<script lang="ts">
  import type { Folder } from './api';
  import { store } from './store.svelte';
  import { isDescendant } from './folderUtils';
  import Self from './FolderTree.svelte';

  let {
    folders,
    parentId = null,
    activeFolderId,
    onSelect,
    onDropNote,
    onDropFolder,
  } = $props<{
    folders: Folder[];
    parentId: string | null;
    activeFolderId: string | null;
    onSelect: (id: string) => void;
    onDropNote: (id: string) => void;
    onDropFolder: (id: string) => void;
  }>();

  let dragOverId = $state<string | null>(null);

  const children = $derived(
    folders.filter((f: Folder) => f.parentId === parentId)
  );

  function canAcceptDrop(targetId: string): boolean {
    const item = store.draggingItem;
    if (!item) return false;
    if (item.kind === 'note') return true;
    if (item.id === targetId) return false;
    if (isDescendant(folders, item.id, targetId)) return false;
    return true;
  }

  function handleDragOver(e: DragEvent, id: string) {
    if (!canAcceptDrop(id)) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    dragOverId = id;
  }

  function handleDragLeave(id: string) {
    if (dragOverId === id) dragOverId = null;
  }

  function handleDrop(e: DragEvent, id: string) {
    e.preventDefault();
    dragOverId = null;
    const item = store.draggingItem;
    if (!item) return;
    if (item.kind === 'note') onDropNote(id);
    else onDropFolder(id);
  }

  function handleDragStart(e: DragEvent, id: string) {
    store.draggingItem = { kind: 'folder', id };
    e.dataTransfer?.setData('text/plain', id);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragEnd() {
    store.draggingItem = null;
  }
</script>

{#each children as folder (folder.id)}
  {@const hasChildren = folders.some((f: Folder) => f.parentId === folder.id)}
  <li>
    {#if hasChildren}
      <details>
        <summary
          class={[
            'nav-entry',
            folder.id === activeFolderId && 'nav-entry--active',
            dragOverId === folder.id && 'nav-entry--drop-target',
            store.draggingItem?.kind === 'folder' &&
              store.draggingItem.id === folder.id &&
              'nav-entry--dragging',
          ]}
          draggable="true"
          onclick={() => onSelect(folder.id)}
          ondragstart={(e) => handleDragStart(e, folder.id)}
          ondragend={handleDragEnd}
          ondragover={(e) => handleDragOver(e, folder.id)}
          ondragleave={() => handleDragLeave(folder.id)}
          ondrop={(e) => handleDrop(e, folder.id)}>{folder.name}</summary
        >
        <ul>
          <Self
            {folders}
            parentId={folder.id}
            {activeFolderId}
            {onSelect}
            {onDropNote}
            {onDropFolder}
          />
        </ul>
      </details>
    {:else}
      <button
        class={[
          'nav-entry',
          folder.id === activeFolderId && 'nav-entry--active',
          dragOverId === folder.id && 'nav-entry--drop-target',
          store.draggingItem?.kind === 'folder' &&
            store.draggingItem.id === folder.id &&
            'nav-entry--dragging',
        ]}
        draggable="true"
        onclick={() => onSelect(folder.id)}
        ondragstart={(e) => handleDragStart(e, folder.id)}
        ondragend={handleDragEnd}
        ondragover={(e) => handleDragOver(e, folder.id)}
        ondragleave={() => handleDragLeave(folder.id)}
        ondrop={(e) => handleDrop(e, folder.id)}>{folder.name}</button
      >
    {/if}
  </li>
{/each}
