/**
 * Tiny helper for matching keyboard shortcuts against a descriptor object.
 *
 * We use `e.code` (position-based) instead of `e.key` so shortcuts work on
 * non-US keyboard layouts where Alt+letter may produce a different character.
 */

export interface Hotkey {
  code: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
}

export function matchHotkey(e: KeyboardEvent, hk: Hotkey): boolean {
  return (
    e.code === hk.code &&
    Boolean(e.ctrlKey) === Boolean(hk.ctrl) &&
    Boolean(e.altKey) === Boolean(hk.alt) &&
    Boolean(e.shiftKey) === Boolean(hk.shift) &&
    Boolean(e.metaKey) === Boolean(hk.meta)
  );
}
