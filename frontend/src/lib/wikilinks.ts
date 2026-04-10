import type { TokenizerAndRendererExtension } from 'marked';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const wikilinkExtension: TokenizerAndRendererExtension = {
  name: 'wikilink',
  level: 'inline',

  start(src: string) {
    return src.indexOf('[[');
  },

  tokenizer(src: string) {
    const match = src.match(/^\[\[([^\]]+)\]\]/);
    if (!match) return undefined;
    return {
      type: 'wikilink',
      raw: match[0],
      title: match[1].trim(),
    };
  },

  renderer(token) {
    const escaped = escapeHtml((token as { title: string }).title);
    return `<a class="wikilink" data-title="${escaped}">${escaped}</a>`;
  },
};
