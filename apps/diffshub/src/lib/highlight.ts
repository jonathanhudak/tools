import type { HighlighterCore } from 'shiki/core';
import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';

import githubLight from 'shiki/themes/github-light.mjs';
import githubDark from 'shiki/themes/github-dark.mjs';

// Curated language set — covers the overwhelming majority of code diffs while
// keeping the build lean. Anything outside this set renders as plain text.
const LANG_LOADERS = {
  typescript: () => import('shiki/langs/typescript.mjs'),
  tsx: () => import('shiki/langs/tsx.mjs'),
  javascript: () => import('shiki/langs/javascript.mjs'),
  jsx: () => import('shiki/langs/jsx.mjs'),
  json: () => import('shiki/langs/json.mjs'),
  html: () => import('shiki/langs/html.mjs'),
  css: () => import('shiki/langs/css.mjs'),
  scss: () => import('shiki/langs/scss.mjs'),
  markdown: () => import('shiki/langs/markdown.mjs'),
  python: () => import('shiki/langs/python.mjs'),
  ruby: () => import('shiki/langs/ruby.mjs'),
  go: () => import('shiki/langs/go.mjs'),
  rust: () => import('shiki/langs/rust.mjs'),
  java: () => import('shiki/langs/java.mjs'),
  c: () => import('shiki/langs/c.mjs'),
  cpp: () => import('shiki/langs/cpp.mjs'),
  csharp: () => import('shiki/langs/csharp.mjs'),
  php: () => import('shiki/langs/php.mjs'),
  bash: () => import('shiki/langs/bash.mjs'),
  yaml: () => import('shiki/langs/yaml.mjs'),
  toml: () => import('shiki/langs/toml.mjs'),
  sql: () => import('shiki/langs/sql.mjs'),
  vue: () => import('shiki/langs/vue.mjs'),
  svelte: () => import('shiki/langs/svelte.mjs'),
  graphql: () => import('shiki/langs/graphql.mjs'),
  docker: () => import('shiki/langs/docker.mjs'),
  kotlin: () => import('shiki/langs/kotlin.mjs'),
  swift: () => import('shiki/langs/swift.mjs'),
} as const;

type Supported = keyof typeof LANG_LOADERS;
export type Language = Supported | 'text';

const EXT_TO_LANG: Record<string, Supported> = {
  ts: 'typescript', tsx: 'tsx', mts: 'typescript', cts: 'typescript',
  js: 'javascript', jsx: 'jsx', mjs: 'javascript', cjs: 'javascript',
  json: 'json', html: 'html', htm: 'html', css: 'css', scss: 'scss', sass: 'scss',
  md: 'markdown', markdown: 'markdown', mdx: 'markdown',
  py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java',
  c: 'c', h: 'c', cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp', hh: 'cpp',
  cs: 'csharp', php: 'php', sh: 'bash', bash: 'bash', zsh: 'bash',
  yml: 'yaml', yaml: 'yaml', toml: 'toml', sql: 'sql',
  vue: 'vue', svelte: 'svelte', graphql: 'graphql', gql: 'graphql',
  kt: 'kotlin', kts: 'kotlin', swift: 'swift',
};

const LIGHT = 'github-light';
const DARK = 'github-dark';

/** Resolve a file path to a supported Shiki language id, or 'text'. */
export function langForPath(path: string): Language {
  const name = (path.split('/').pop() ?? path).toLowerCase();
  if (name === 'dockerfile' || name.endsWith('.dockerfile')) return 'docker';
  const ext = name.includes('.') ? name.split('.').pop()! : '';
  return EXT_TO_LANG[ext] ?? 'text';
}

let highlighterPromise: Promise<HighlighterCore | null> | null = null;
const loaded = new Set<string>();

async function getHighlighter(): Promise<HighlighterCore | null> {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      try {
        return await createHighlighterCore({
          themes: [githubLight, githubDark],
          langs: [],
          engine: createOnigurumaEngine(import('shiki/wasm')),
        });
      } catch {
        return null;
      }
    })();
  }
  return highlighterPromise;
}

async function ensureLang(hl: HighlighterCore, lang: Supported): Promise<boolean> {
  if (loaded.has(lang)) return true;
  try {
    const mod = await LANG_LOADERS[lang]();
    await hl.loadLanguage(mod.default);
    loaded.add(lang);
    return true;
  } catch {
    return false;
  }
}

/**
 * Highlight a batch of raw code lines. Returns a map from raw line -> inner HTML
 * (token spans only). Unsupported languages / failures yield an empty map and the
 * caller falls back to escaped plain text.
 */
export async function highlightLines(
  lines: string[],
  lang: Language,
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (lang === 'text') return out;

  const unique = Array.from(new Set(lines));
  if (unique.length === 0) return out;

  const hl = await getHighlighter();
  if (!hl) return out;
  if (!(await ensureLang(hl, lang))) return out;

  const parser = new DOMParser();
  for (const line of unique) {
    try {
      const html = hl.codeToHtml(line || ' ', {
        lang,
        themes: { light: LIGHT, dark: DARK },
        defaultColor: false,
      });
      const lineEl = parser.parseFromString(html, 'text/html').querySelector('.line');
      if (lineEl) out.set(line, lineEl.innerHTML);
    } catch {
      // Fall back to plain text for this line.
    }
  }
  return out;
}
