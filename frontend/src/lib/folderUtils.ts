import type { Folder } from './api';

export function isDescendant(
  folders: Folder[],
  ancestorId: string,
  candidateId: string
): boolean {
  let current = folders.find((f) => f.id === candidateId);
  const visited = new Set<string>();
  while (current?.parentId) {
    if (current.parentId === ancestorId) return true;
    if (visited.has(current.parentId)) return false;
    visited.add(current.parentId);
    current = folders.find((f) => f.id === current!.parentId);
  }
  return false;
}
