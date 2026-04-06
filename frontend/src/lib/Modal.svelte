<script lang="ts">
  import type { Snippet } from 'svelte';
  import { store } from './store.svelte';

  const { title, children }: { title: string; children: Snippet } = $props();
</script>

<div class="modal-backdrop">
  <div class="modal-content">
    <div class="modal-header">
      <h2>{title}</h2>
      <button class="modal-close" aria-label="Close" onclick={() => (store.modal = null)}
        >×</button
      >
    </div>
    <div class="modal-body">
      {@render children()}
    </div>
  </div>
</div>
