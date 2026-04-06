<script lang="ts">
  import type { Folder } from './api';
  import Self from './FolderTree.svelte';

  let {
    folders,
    parentId = null,
    activeFolderId,
    onSelect,
  } = $props<{
    folders: Folder[];
    parentId: string | null;
    activeFolderId: string | null;
    onSelect: (id: string) => void;
  }>();

  const children = $derived(
    folders.filter((f: Folder) => f.parentId === parentId)
  );
</script>

{#each children as folder (folder.id)}
  {@const hasChildren = folders.some((f: Folder) => f.parentId === folder.id)}
  <li>
    {#if hasChildren}
      <details>
        <summary
          class:active={folder.id === activeFolderId}
          onclick={() => onSelect(folder.id)}>{folder.name}</summary
        >
        <ul>
          <Self {folders} parentId={folder.id} {activeFolderId} {onSelect} />
        </ul>
      </details>
    {:else}
      <button
        class:active={folder.id === activeFolderId}
        onclick={() => onSelect(folder.id)}>{folder.name}</button
      >
    {/if}
  </li>
{/each}
