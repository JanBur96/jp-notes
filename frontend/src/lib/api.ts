import { mockApi } from './api.mock';

const BASE = '/api';

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  folderId: string | null;
  folder: Folder | null;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let message = `API error: ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {}
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

const realApi = {
  notes: {
    list: (params?: {
      folderId?: string | null;
      search?: string;
      archived?: boolean;
    }) => {
      const query = new URLSearchParams(
        Object.entries(params || {})
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => [k, String(v)])
      ).toString();
      return request<Note[]>(`/notes${query ? `?${query}` : ''}`);
    },
    get: (id: string) => request<Note>(`/notes/${id}`),
    create: (data: { title: string; content: string; folderId?: string }) =>
      request<Note>('/notes', { method: 'POST', body: JSON.stringify(data) }),
    update: (
      id: string,
      data: {
        title?: string;
        content?: string;
        pinned?: boolean;
        archived?: boolean;
        folderId?: string | null;
      }
    ) =>
      request<Note>(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request<void>(`/notes/${id}`, { method: 'DELETE' }),
  },
  folders: {
    list: () => request<Folder[]>('/folders'),
    get: (id: string) => request<Folder>(`/folders/${id}`),
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
  ai: {
    summarize: (noteId: string) =>
      request<{ summary: string }>(`/ai/summarize/${noteId}`, {
        method: 'POST',
      }),
  },
};

export const api = import.meta.env.VITE_DEMO === 'true' ? mockApi : realApi;
