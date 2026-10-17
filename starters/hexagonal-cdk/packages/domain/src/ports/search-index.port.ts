import type { ComponentDoc } from '../model/component-doc.js';
import type { SearchHit } from '../model/search.js';

/** Full-text index over ComponentDocs. Implemented in adapters-driven. */
export interface SearchIndexPort {
  upsert(doc: ComponentDoc): Promise<void>;
  search(query: string, limit: number): Promise<readonly SearchHit[]>;
}
