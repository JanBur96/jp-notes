<script lang="ts">
  import Sidebar from './lib/Sidebar.svelte'
  import NoteList from './lib/NoteList.svelte'
  import NoteEditor from './lib/NoteEditor.svelte'
</script>

<div class="app-shell">
  <div class="toolbar">
    <span class="toolbar-title">JP<span>Notes</span></span>
    <button class="toolbar-btn primary">New Note</button>
    <button class="toolbar-btn">New Folder</button>
    <div class="toolbar-sep"></div>
    <button class="toolbar-btn">Delete</button>
    <div class="toolbar-sep"></div>
    <button class="toolbar-btn">Bold</button>
    <button class="toolbar-btn">Italic</button>
    <button class="toolbar-btn">Code</button>
    <div class="toolbar-spacer"></div>
    <button class="toolbar-btn">Search</button>
  </div>

  <div class="app-body">
    <Sidebar />
    <NoteList />
    <NoteEditor />
  </div>

  <div class="status-bar">
    <span>Work / Meetings</span>
    <span>·</span>
    <span>3 notes</span>
    <span>·</span>
    <span>Last edited Jan 15, 2026</span>
  </div>
</div>
