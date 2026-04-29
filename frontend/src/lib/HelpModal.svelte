<script lang="ts">
  import Modal from './Modal.svelte';
  import { store } from './store.svelte';

  const shortcuts: { keys: string[]; label: string }[] = [
    { keys: ['Ctrl', 'Alt', 'N'], label: 'New note' },
    { keys: ['Ctrl', 'Alt', 'F'], label: 'New folder' },
    { keys: ['Ctrl', 'Alt', 'K'], label: 'Focus search' },
    { keys: ['Ctrl', 'Alt', '1'], label: 'Toggle folder tree' },
    { keys: ['Ctrl', 'Alt', '2'], label: 'Toggle note list' },
    { keys: ['Ctrl', 'Alt', '/'], label: 'Open this help' },
    { keys: ['Esc'], label: 'Close modal' },
    { keys: ['Ctrl', 'B'], label: 'Bold (in editor)' },
    { keys: ['Ctrl', 'I'], label: 'Italic (in editor)' },
    { keys: ['Ctrl', 'E'], label: 'Inline code (in editor)' },
    { keys: ['Ctrl', 'K'], label: 'Insert link (in editor)' },
    { keys: ['Ctrl', 'Shift', '8'], label: 'Bulleted list (in editor)' },
  ];
</script>

{#if store.modal?.kind === 'help'}
  <Modal title="Keyboard shortcuts">
    <ul class="help__list">
      {#each shortcuts as { keys, label }}
        <li class="help__row">
          <span class="help__label">{label}</span>
          <span class="help__keys">
            {#each keys as key, i}
              {#if i > 0}<span class="help__plus">+</span>{/if}
              <kbd class="help__kbd">{key}</kbd>
            {/each}
          </span>
        </li>
      {/each}
    </ul>
  </Modal>
{/if}

<style>
  .help__list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .help__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 10px 4px;
    border-bottom: 1px solid rgba(140, 180, 240, 0.06);
  }

  .help__row:last-child {
    border-bottom: none;
  }

  .help__label {
    font-size: 13px;
    color: var(--text-2);
  }

  .help__keys {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .help__plus {
    font-size: 11px;
    color: var(--text-3);
  }

  .help__kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 7px;
    border: 1px solid var(--border-hi);
    border-radius: 5px;
    background: rgba(20, 30, 50, 0.55);
    font-family:
      ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
    font-size: 11px;
    font-weight: 500;
    color: var(--text);
    box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.25);
  }
</style>
