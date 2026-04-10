import type { Note, Folder } from './api';

const SEED_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Work', parentId: null },
  { id: 'f2', name: 'Meetings', parentId: 'f1' },
  { id: 'f3', name: 'Personal', parentId: null },
  { id: 'f4', name: 'Dev Notes', parentId: null },
];

const work     = SEED_FOLDERS[0];
const meetings = SEED_FOLDERS[1];
const personal = SEED_FOLDERS[2];
const devNotes = SEED_FOLDERS[3];

const SEED_NOTES: Note[] = [
  {
    id: 'n1',
    title: 'Q2 Kickoff - Meeting Notes',
    folderId: meetings.id,
    folder: meetings,
    pinned: false,
    archived: false,
    createdAt: '2026-04-04T10:30:00Z',
    updatedAt: '2026-04-04T10:30:00Z',
    content: `## Attendees
Jan, Sarah, Mike, Product

## Agenda
1. Q1 retrospective
2. Q2 goals and priorities
3. Team assignments

---

### Q1 Retrospective
- Shipped Phase 1 of JP Notes on time
- Backend performance was a bottleneck in March
- Mobile UX needs improvement before wider release

### Q2 Goals
- Launch Phase 2: tags, search, archive
- Improve API response time to under 200 ms
- Mobile-first UI redesign

## Action Items
- [ ] Jan: finalize Phase 2 spec by Apr 10
- [ ] Sarah: performance audit by Apr 12
- [ ] Mike: mobile wireframes by Apr 15
`,
  },
  {
    id: 'n2',
    title: 'Project Ideas',
    folderId: work.id,
    folder: work,
    pinned: true,
    archived: false,
    createdAt: '2026-03-28T14:15:00Z',
    updatedAt: '2026-03-28T14:15:00Z',
    content: `## Active Ideas

### JP Notes
- Real-time collaboration via WebSockets
- Mobile app with Capacitor
- AI-powered note summarization
- CLI tool: \`jpnotes add "quick thought"\`

### Side Projects
- Browser extension to clip web pages into notes
- Weekly digest email from pinned notes
- See [[Svelte 5 Runes]] for framework notes

## Backlog
- Voice-to-text input
- Custom color themes per folder

> Finish one thing before starting the next.
`,
  },
  {
    id: 'n3',
    title: 'Weekend Grocery List',
    folderId: personal.id,
    folder: personal,
    pinned: false,
    archived: false,
    createdAt: '2026-04-05T08:00:00Z',
    updatedAt: '2026-04-05T08:00:00Z',
    content: `## Produce
- Apples
- Spinach
- Bell peppers
- Cherry tomatoes

## Pantry
- Pasta (spaghetti)
- Olive oil
- Canned tomatoes
- Chickpeas

## Household
- Dish soap
- Paper towels
- Coffee filters
`,
  },
  {
    id: 'n4',
    title: 'Svelte 5 Runes',
    folderId: devNotes.id,
    folder: devNotes,
    pinned: false,
    archived: false,
    createdAt: '2026-03-20T19:45:00Z',
    updatedAt: '2026-03-20T19:45:00Z',
    content: `## Core Runes

### \`$state\`
Reactive state - replaces \`let\` with stores.
\`\`\`svelte
let count = $state(0);
\`\`\`

### \`$derived\`
Computed values - replaces \`$:\` reactive declarations.
\`\`\`svelte
const double = $derived(count * 2);
\`\`\`

### \`$effect\`
Side effects with optional cleanup.
\`\`\`svelte
$effect(() => {
  document.title = \`Count: \${count}\`;
  return () => { document.title = 'App'; };
});
\`\`\`

### \`$props\`
Component props - replaces \`export let\`.
\`\`\`svelte
let { name, age = 0 } = $props();
\`\`\`

## Tips
- Prefer \`$derived\` over \`$effect\` wherever possible
- \`$state\` works in \`.svelte.ts\` files outside components
- \`$effect\` runs after the DOM is updated
`,
  },
  {
    id: 'n5',
    title: 'Inbox',
    folderId: null,
    folder: null,
    pinned: false,
    archived: false,
    createdAt: '2026-04-05T09:30:00Z',
    updatedAt: '2026-04-05T09:30:00Z',
    content: `Random things to sort later:

- Look into Cloudflare Workers for the backend
- Check if \`marked\` handles GFM tables correctly in preview
- Sidebar feels narrow on 1280px screens, maybe 240px?
- Consider a "focus mode" that hides the sidebar and note list
- Add word count to the status bar (cheap win)
`,
  },
];

const STORAGE_KEY = 'jp-notes-demo';

type DemoState = { notes: Note[]; folders: Folder[] };

function load(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DemoState;
  } catch {
  }
  return { notes: SEED_NOTES, folders: SEED_FOLDERS };
}

function save(state: DemoState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const mockApi = {
  notes: {
    list: async (params?: { folderId?: string | null; search?: string; archived?: boolean }) => {
      let { notes } = load();
      const showArchived = params?.archived ?? false;

      notes = notes.filter((n) => (n.archived ?? false) === showArchived);

      if (params?.folderId) {
        notes = notes.filter((n) => n.folderId === params.folderId);
      }

      if (params?.search) {
        const q = params.search.toLowerCase();
        notes = notes.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q)
        );
      }

      return notes;
    },

    get: async (id: string) => {
      const { notes } = load();
      const note = notes.find((n) => n.id === id);
      if (!note) throw new Error(`Note not found: ${id}`);
      return note;
    },

    create: async (data: { title: string; content: string; folderId?: string }) => {
      const state = load();
      const folder = data.folderId
        ? (state.folders.find((f) => f.id === data.folderId) ?? null)
        : null;

      const note: Note = {
        id: crypto.randomUUID(),
        title: data.title,
        content: data.content,
        pinned: false,
        archived: false,
        folderId: data.folderId ?? null,
        folder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.notes.push(note);
      save(state);
      return note;
    },

    update: async (
      id: string,
      data: { title?: string; content?: string; pinned?: boolean; archived?: boolean; folderId?: string | null }
    ) => {
      const state = load();
      const idx = state.notes.findIndex((n) => n.id === id);
      if (idx === -1) throw new Error(`Note not found: ${id}`);

      Object.assign(state.notes[idx], { ...data, updatedAt: new Date().toISOString() });
      if (data.folderId !== undefined) {
        state.notes[idx].folder = data.folderId
          ? (state.folders.find((f) => f.id === data.folderId) ?? null)
          : null;
      }
      save(state);
      return state.notes[idx];
    },

    delete: async (id: string) => {
      const state = load();
      state.notes = state.notes.filter((n) => n.id !== id);
      save(state);
    },
  },

  ai: {
    summarize: async (noteId: string) => {
      await new Promise((r) => setTimeout(r, 600));
      const { notes } = load();
      const note = notes.find((n) => n.id === noteId);
      if (!note) throw new Error(`Note not found: ${noteId}`);
      const wordCount = note.content.split(/\s+/).filter(Boolean).length;
      const firstLine =
        note.content
          .split('\n')
          .map((l) => l.replace(/^[#>\-*\s]+/, '').trim())
          .find(Boolean) ?? '';
      return {
        summary: `"${note.title || 'Untitled'}" (~${wordCount} words). Opens with: ${firstLine.slice(0, 120)}${firstLine.length > 120 ? '...' : ''}`,
      };
    },
  },

  folders: {
    list: async () => load().folders,

    get: async (id: string) => {
      const { folders } = load();
      const folder = folders.find((f) => f.id === id);
      if (!folder) throw new Error(`Folder not found: ${id}`);
      return folder;
    },

    create: async (data: { name: string; parentId?: string }) => {
      const state = load();
      const folder: Folder = {
        id: crypto.randomUUID(),
        name: data.name,
        parentId: data.parentId ?? null,
      };
      state.folders.push(folder);
      save(state);
      return folder;
    },

    update: async (id: string, data: Partial<Folder>) => {
      const state = load();
      const idx = state.folders.findIndex((f) => f.id === id);
      if (idx === -1) throw new Error(`Folder not found: ${id}`);
      Object.assign(state.folders[idx], data);
      save(state);
      return state.folders[idx];
    },

    delete: async (id: string) => {
      const state = load();
      state.folders = state.folders.filter((f) => f.id !== id);
      save(state);
    },
  },

  export: {
    async download() {
      alert('Export is not available in demo mode');
    },
  },
};
