<script lang="ts">
  import { api } from './api';
  import { loadNotes, store } from './store.svelte';
  let activeFolderName = $state<string>('');

  $effect(() => {
    const folderId = store.activeFolderId;

    void loadNotes(folderId);

    if (!folderId) {
      activeFolderName = 'All Notes';
      return;
    }

    void api.folders.get(folderId).then((folder) => {
      if (store.activeFolderId === folderId) {
        activeFolderName = folder.name;
      }
    });
  });
</script>

<div class="pane-list">
  <div class="section-label">
    NOTES {activeFolderName ? `— ${activeFolderName}` : ''}
  </div>
  <ul class="note-list">
    {#each store.notes as note (note.id)}
      <li class="note-item">
        <button
          type="button"
          class="note-item-btn"
          onclick={() => (store.activeNoteId = note.id)}
        >
          <div class="note-title">{note.title}</div>
          <div class="note-meta">
            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
            <!-- Phase 2: Tags display
            {#if note.tags}
              {#each note.tags as tag}
                <span class="note-tag">{tag.name}</span>
              {/each}
            {/if}
            -->
          </div>
        </button>
      </li>
    {/each}
  </ul>
</div>
