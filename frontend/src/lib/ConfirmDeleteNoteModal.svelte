<script lang="ts">
  import Modal from './Modal.svelte';
  import { store, deleteNote } from './store.svelte';

  const activeNote = $derived(
    store.notes.find((n) => n.id === store.activeNoteId) ??
      store.archivedNotes.find((n) => n.id === store.activeNoteId) ??
      null
  );
  const isArchived = $derived(activeNote?.archived ?? false);

  function confirm() {
    if (store.modal?.kind !== 'confirm-delete-note') return;
    if (!store.activeNoteId) return;
    deleteNote(store.activeNoteId);
    store.modal = null;
  }

  function cancel() {
    store.modal = null;
  }
</script>

{#if store.modal?.kind === 'confirm-delete-note'}
  <Modal title={isArchived ? 'Delete note' : 'Archive note'}>
    <p class="modal-text">
      {#if isArchived}
        This note will be removed permanently. This action cannot be undone.
      {:else}
        This note will be moved to the archive. You can restore it later.
      {/if}
    </p>
    <div class="modal-actions">
      <button class="toolbar-btn" onclick={cancel}>Cancel</button>
      <button class="toolbar-btn toolbar-btn--error" onclick={confirm}>
        {isArchived ? 'Delete' : 'Archive'}
      </button>
    </div>
  </Modal>
{/if}

<style>
  .modal-text {
    font-family: 'Lora', Georgia, serif;
    font-size: 14px;
    font-style: italic;
    line-height: 1.65;
    color: var(--text-2);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 22px;
  }
</style>
