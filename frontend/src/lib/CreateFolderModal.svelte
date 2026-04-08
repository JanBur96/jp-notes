<script lang="ts">
  import Modal from './Modal.svelte';
  import { store, createFolder } from './store.svelte';

  function submit() {
    if (store.modal?.kind !== 'create-folder') return;
    const name = store.modal.name.trim();
    if (!name) return;

    createFolder(name, store.activeFolderId ?? undefined);
    store.modal = null;
  }
</script>

{#if store.modal?.kind === 'create-folder'}
  <Modal title="Create folder">
    <label class="modal-field">
      <input
        bind:value={store.modal.name}
        class="modal-input"
        placeholder="Folder name"
        onkeydown={(e) => e.key === 'Enter' && submit()}
      />
    </label>
    <button class="modal-button toolbar-btn primary" onclick={submit}>
      Create
    </button>
  </Modal>
{/if}

<style>
  .modal-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .modal-input {
    padding: 9px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    outline: none;
    background: var(--surface-3);
    font-family: inherit;
    font-size: 13px;
    color: var(--text);
    transition: border-color 0.12s;
  }

  .modal-input:focus {
    border-color: rgba(192, 144, 48, 0.35);
  }

  .modal-button {
    margin-top: 14px;
  }
</style>
