<script lang="ts">
  import Modal from './Modal.svelte';
  import { store, createFolder } from './store.svelte';

  let inputEl: HTMLInputElement | null = $state(null);

  // Focus the field on mount so the user can type immediately.
  $effect(() => {
    inputEl?.focus();
  });

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
        bind:this={inputEl}
        bind:value={store.modal.name}
        class="modal-input"
        placeholder="Folder name…"
        onkeydown={(e) => e.key === 'Enter' && submit()}
      />
    </label>
    <div class="modal-actions">
      <button class="toolbar-btn" onclick={() => (store.modal = null)}>
        Cancel
      </button>
      <button class="toolbar-btn primary" onclick={submit}>
        Create folder
      </button>
    </div>
  </Modal>
{/if}

<style>
  .modal-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .modal-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border-hi);
    border-radius: var(--radius-sm);
    outline: none;
    background: rgba(8, 14, 26, 0.6);
    font-family: inherit;
    font-size: 14px;
    color: var(--text);
    transition:
      border-color var(--dur) var(--ease),
      background var(--dur) var(--ease),
      box-shadow var(--dur) var(--ease);
  }

  .modal-input::placeholder {
    color: var(--text-3);
  }

  .modal-input:focus {
    border-color: rgba(228, 178, 89, 0.45);
    background: rgba(12, 20, 36, 0.75);
    box-shadow:
      0 0 0 3px rgba(228, 178, 89, 0.1),
      0 4px 18px -6px rgba(228, 178, 89, 0.25);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 18px;
  }
</style>
