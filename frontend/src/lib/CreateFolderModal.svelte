<script lang="ts">
  import Modal from './Modal.svelte';
  import { store, createFolder } from './store.svelte';

  let inputEl: HTMLInputElement | null = $state(null);

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
    <label class="create-folder__field">
      <input
        bind:this={inputEl}
        bind:value={store.modal.name}
        class="create-folder__input"
        placeholder="Folder name…"
        onkeydown={(e) => e.key === 'Enter' && submit()}
      />
    </label>
    <div class="create-folder__actions">
      <button class="toolbar-btn" onclick={() => (store.modal = null)}>
        Cancel
      </button>
      <button class="toolbar-btn toolbar-btn--primary" onclick={submit}>
        Create folder
      </button>
    </div>
  </Modal>
{/if}

<style>
  .create-folder__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .create-folder__input {
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

  .create-folder__input::placeholder {
    color: var(--text-3);
  }

  .create-folder__input:focus {
    border-color: rgba(228, 178, 89, 0.45);
    background: rgba(12, 20, 36, 0.75);
    box-shadow:
      0 0 0 3px rgba(228, 178, 89, 0.1),
      0 4px 18px -6px rgba(228, 178, 89, 0.25);
  }

  .create-folder__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 18px;
  }
</style>
