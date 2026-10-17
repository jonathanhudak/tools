import { score, searchableTerms, type ComponentDoc, type SearchHit, type SearchIndexPort } from '@hex/domain';

export class InMemorySearchIndex implements SearchIndexPort {
  private readonly terms = new Map<ComponentDoc['id'], readonly string[]>();

  async upsert(doc: ComponentDoc): Promise<void> {
    this.terms.set(doc.id, searchableTerms(doc));
  }

  async search(query: string, limit: number): Promise<readonly SearchHit[]> {
    return [...this.terms.entries()]
      .map(([id, terms]) => ({ id, score: score(terms, query) }))
      .filter((hit) => hit.score > 0)
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
      .slice(0, limit);
  }
}
