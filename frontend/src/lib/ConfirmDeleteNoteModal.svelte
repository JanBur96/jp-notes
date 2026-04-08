<script lang="ts">
  import Modal from './Modal.svelte';
  import { store, deleteNote } from './store.svelte';

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
  <Modal title="Delete note">
    <p class="modal-text">
      This note will be removed permanently. This action cannot be undone.
    </p>
    <div class="modal-actions">
      <button class="toolbar-btn" onclick={cancel}>Cancel</button>
      <button class="toolbar-btn toolbar-btn--error" onclick={confirm}>
        Delete
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
