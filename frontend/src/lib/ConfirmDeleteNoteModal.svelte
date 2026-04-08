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
    <p>Are you sure you want to delete this note?</p>
    <button class="modal-button toolbar-btn primary" onclick={confirm}>
      Delete
    </button>
    <button class="modal-button toolbar-btn" onclick={cancel}>Cancel</button>
  </Modal>
{/if}

<style>
  .modal-button {
    margin-top: 14px;
  }
</style>
