<script lang="ts">
  import Modal from './Modal.svelte';
  import { store, deleteAllArchivedNotes } from './store.svelte';

  const count = $derived(store.archivedNotes.length);

  function confirm() {
    if (store.modal?.kind !== 'confirm-delete-all-archived') return;
    deleteAllArchivedNotes();
    store.modal = null;
  }

  function cancel() {
    store.modal = null;
  }
</script>

{#if store.modal?.kind === 'confirm-delete-all-archived'}
  <Modal title="Delete all archived notes">
    <p class="confirm-delete__text">
      {count}
      {count === 1 ? 'note' : 'notes'} will be removed permanently. This action
      cannot be undone.
    </p>
    <div class="confirm-delete__actions">
      <button class="toolbar-btn" onclick={cancel}>Cancel</button>
      <button class="toolbar-btn toolbar-btn--error" onclick={confirm}>
        Delete all
      </button>
    </div>
  </Modal>
{/if}

<style>
  .confirm-delete__text {
    font-family: 'Lora', Georgia, serif;
    font-size: 14px;
    font-style: italic;
    line-height: 1.65;
    color: var(--text-2);
  }

  .confirm-delete__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 22px;
  }
</style>
