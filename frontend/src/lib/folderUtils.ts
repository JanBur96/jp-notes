import type { Folder } from './api';

/**
 * Walks up the parent chain of `candidateId` and returns true if `ancestorId`
 * is reached. Used to reject drag-and-drop moves that would create a cycle
 * (e.g. dropping a folder into its own child).
 */
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
