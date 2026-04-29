import type { EditorState, ChangeSpec } from '@codemirror/state';
import { EditorSelection } from '@codemirror/state';
import type { Command, KeyBinding } from '@codemirror/view';

function toggleWrap(marker: string): Command {
  return (view) => {
    const { state } = view;
    const changes: ChangeSpec[] = [];
    const newRanges = state.selection.ranges.map((range) => {
      const text = state.sliceDoc(range.from, range.to);
      const len = marker.length;

      if (
        text.length >= len * 2 &&
        text.startsWith(marker) &&
        text.endsWith(marker)
      ) {
        const inner = text.slice(len, text.length - len);
        changes.push({ from: range.from, to: range.to, insert: inner });
        return EditorSelection.range(range.from, range.from + inner.length);
      }

      changes.push({ from: range.from, to: range.to, insert: `${marker}${text}${marker}` });
      const innerStart = range.from + len;
      return EditorSelection.range(innerStart, innerStart + text.length);
    });

    view.dispatch({
      changes,
      selection: EditorSelection.create(newRanges, state.selection.mainIndex),
      userEvent: 'input.format',
    });
    return true;
  };
}

function lineRange(state: EditorState, from: number, to: number) {
  const startLine = state.doc.lineAt(from);
  const endLine = state.doc.lineAt(to);
  return { startLine, endLine };
}

function toggleLinePrefix(getPrefix: (lineNumber: number, index: number) => string): Command {
  return (view) => {
    const { state } = view;
    const changes: ChangeSpec[] = [];
    const seen = new Set<number>();

    type LineEdit = { from: number; oldLen: number; newLen: number };
    const editsByRange: LineEdit[][] = [];

    for (const range of state.selection.ranges) {
      const { startLine, endLine } = lineRange(state, range.from, range.to);
      const lines = [];
      for (let n = startLine.number; n <= endLine.number; n++) {
        if (seen.has(n)) continue;
        seen.add(n);
        lines.push(state.doc.line(n));
      }

      const prefixes = lines.map((l, i) => getPrefix(l.number, i));
      const allHavePrefix = lines.every((l, i) => l.text.startsWith(prefixes[i]));

      const edits: LineEdit[] = [];
      lines.forEach((l, i) => {
        const prefix = prefixes[i];
        if (allHavePrefix) {
          changes.push({ from: l.from, to: l.from + prefix.length, insert: '' });
          edits.push({ from: l.from, oldLen: prefix.length, newLen: 0 });
        } else if (!l.text.startsWith(prefix)) {
          changes.push({ from: l.from, insert: prefix });
          edits.push({ from: l.from, oldLen: 0, newLen: prefix.length });
        }
      });
      editsByRange.push(edits);
    }

    const newRanges = state.selection.ranges.map((range, i) => {
      const edits = editsByRange[i] ?? [];
      let from = range.from;
      let to = range.to;
      for (const e of edits) {
        const delta = e.newLen - e.oldLen;
        if (e.from <= from) from += delta;
        if (e.from <= to) to += delta;
      }
      return EditorSelection.range(from, to);
    });

    view.dispatch({
      changes,
      selection: EditorSelection.create(newRanges, state.selection.mainIndex),
      userEvent: 'input.format',
    });
    return true;
  };
}

const toggleUnorderedList = toggleLinePrefix(() => '- ');

const insertLink: Command = (view) => {
  const { state } = view;
  const changes: ChangeSpec[] = [];
  const newRanges = state.selection.ranges.map((range) => {
    const text = state.sliceDoc(range.from, range.to);
    if (text.length === 0) {
      const inserted = '[](url)';
      changes.push({ from: range.from, insert: inserted });
      const cursor = range.from + 1;
      return EditorSelection.range(cursor, cursor);
    }
    const inserted = `[${text}](url)`;
    changes.push({ from: range.from, to: range.to, insert: inserted });
    const urlStart = range.from + text.length + 3;
    return EditorSelection.range(urlStart, urlStart + 3);
  });

  view.dispatch({
    changes,
    selection: EditorSelection.create(newRanges, state.selection.mainIndex),
    userEvent: 'input.format',
  });
  return true;
};

export const markdownShortcuts: KeyBinding[] = [
  { key: 'Mod-b', run: toggleWrap('**'), preventDefault: true },
  { key: 'Mod-i', run: toggleWrap('*'), preventDefault: true },
  { key: 'Mod-e', run: toggleWrap('`'), preventDefault: true },
  { key: 'Mod-k', run: insertLink, preventDefault: true },
  { key: 'Mod-Shift-8', run: toggleUnorderedList, preventDefault: true },
  { key: 'Mod-/', run: () => true, preventDefault: true },
];
