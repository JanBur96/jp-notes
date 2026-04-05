const BASE = '/api';

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  folderId: string | null;
  folder: Folder | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface Tag {
  id: string;
  name: string;
  _count?: { notes: number };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  notes: {
    list: (params?: {
      folderId?: string | null;
      // Phase 2: tag?: string;
      search?: string;
    }) => {
      const query = new URLSearchParams(
        Object.entries(params || {}).filter(([, v]) => v) as [string, string][]
      ).toString();
      return request<Note[]>(`/notes${query ? `?${query}` : ''}`);
    },
    get: (id: string) => request<Note>(`/notes/${id}`),
    create: (data: {
      title: string;
      content: string;
      folderId?: string;
      // Phase 2: tags?: string[];
    }) =>
      request<Note>('/notes', { method: 'POST', body: JSON.stringify(data) }),
    update: (
      id: string,
      data: {
        title?: string;
        content?: string;
        pinned?: boolean;
        folderId?: string | null;
        // Phase 2: tags?: string[];
      }
    ) =>
      request<Note>(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request<void>(`/notes/${id}`, { method: 'DELETE' }),
  },
  folders: {
    list: () => {
      return request<Folder[]>('/folders');
    },
    get: (id: string | null) => request<Folder>(`/folders/${id}`),
    create: (data: { name: string; parentId?: string }) =>
      request<Folder>('/folders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Folder>) =>
      request<Folder>(`/folders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/folders/${id}`, { method: 'DELETE' }),
  },
  // Phase 2: tags: {
  //   list: () => request<Tag[]>('/tags'),
  //   get: (id: string) => request<Tag>(`/tags/${id}`),
  //   create: (data: { name: string }) =>
  //     request<Tag>('/tags', { method: 'POST', body: JSON.stringify(data) }),
  //   update: (id: string, data: Partial<Tag>) =>
  //     request<Tag>(`/tags/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  //   delete: (id: string) => request<void>(`/tags/${id}`, { method: 'DELETE' }),
  // },
};
