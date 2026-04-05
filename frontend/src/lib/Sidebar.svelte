<script lang="ts">
  import { api } from './api';
  import { onMount } from 'svelte';
  import { type Folder } from './api'; // Phase 2: import Tag
  import FolderTree from './FolderTree.svelte';
  import { store } from './store.svelte';

  let folders = $state<Folder[]>([]);
  // Phase 2: let tags = $state<Tag[]>([]);

  onMount(async () => {
    folders = await api.folders.list();
    // Phase 2: tags = await api.tags.list();

    console.log('Fetched folders:', folders);
    // Phase 2: console.log('Fetched tags:', tags);
  });

  function selectFolder(id: string) {
    store.activeFolderId = id;
    console.log('Selected folder ID:', id);
  }

  function selectAllNotes() {
    store.activeFolderId = null;
  }
</script>

<div class="pane-sidebar">
  <div class="section-label">Folders</div>

  <ul class="folder-tree">
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <li>
      <span
        class:active={store.activeFolderId === null}
        onclick={selectAllNotes}
      >
        All Notes
      </span>
    </li>
    <li>
      <ul>
        <FolderTree
          {folders}
          parentId={null}
          activeFolderId={store.activeFolderId}
          onSelect={selectFolder}
        />
      </ul>
    </li>
    <li><span>Archive</span></li>
  </ul>

  <!-- Phase 2: Tags section
  <div class="section-label">Tags</div>
  <div class="tags">
    <span class="tag active">work</span>
    <span class="tag">personal</span>
    <span class="tag">todo</span>
    <span class="tag">ideas</span>
    <span class="tag">important</span>
    <span class="tag">meetings</span>
  </div>
  -->
</div>
