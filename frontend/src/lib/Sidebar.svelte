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
    // TODO
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
