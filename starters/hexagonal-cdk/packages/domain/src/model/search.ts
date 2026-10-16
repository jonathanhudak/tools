import type { ComponentDoc } from './component-doc.js';

/** Pure search primitives shared by every SearchIndexPort implementation. */
export const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);

export const searchableTerms = (doc: ComponentDoc): string[] => [
  ...tokenize(doc.name),
  ...tokenize(doc.name),
  ...tokenize(doc.description),
  ...doc.props.flatMap((p) => tokenize(p.name)),
  ...doc.tokens.flatMap(tokenize),
];

/** Term-frequency score of a document's terms against a query. 0 means no match. */
export const score = (terms: readonly string[], query: string): number => {
  const wanted = new Set(tokenize(query));
  if (wanted.size === 0) return 0;
  let hits = 0;
  const matched = new Set<string>();
  for (const term of terms) {
    if (wanted.has(term)) {
      hits += 1;
      matched.add(term);
    }
  }
  // Require every query term to appear somewhere (AND semantics).
  return matched.size === wanted.size ? hits : 0;
};

export interface SearchHit {
  readonly id: ComponentDoc['id'];
  readonly score: number;
}
