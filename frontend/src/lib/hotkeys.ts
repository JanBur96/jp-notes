// Use e.code (not e.key) so Alt+letter combos work on non-US layouts.

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
