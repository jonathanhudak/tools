import type { ComponentDoc, ComponentRepoPort, SearchIndexPort } from '@hex/domain';

export interface SearchComponentsDeps {
  readonly repo: ComponentRepoPort;
  readonly index: SearchIndexPort;
}

export interface SearchComponentsQuery {
  readonly query: string;
  readonly limit?: number;
}

export interface SearchResult {
  readonly doc: ComponentDoc;
  readonly score: number;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export class SearchComponents {
  constructor(private readonly deps: SearchComponentsDeps) {}

  async execute({ query, limit = DEFAULT_LIMIT }: SearchComponentsQuery): Promise<readonly SearchResult[]> {
    const capped = Math.max(1, Math.min(MAX_LIMIT, Math.floor(limit)));
    const hits = await this.deps.index.search(query, capped);
    const results = await Promise.all(
      hits.map(async (hit) => {
        const doc = await this.deps.repo.get(hit.id);
        return doc ? { doc, score: hit.score } : null;
      }),
    );
    // The index may be ahead of/behind the repo; drop hits we cannot hydrate.
    return results.filter((r): r is SearchResult => r !== null);
  }
}
