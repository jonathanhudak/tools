import { type ComponentDoc, type SearchHit, type SearchIndexPort } from '@hex/domain';
export declare class InMemorySearchIndex implements SearchIndexPort {
    private readonly terms;
    upsert(doc: ComponentDoc): Promise<void>;
    search(query: string, limit: number): Promise<readonly SearchHit[]>;
}
//# sourceMappingURL=in-memory-search-index.adapter.d.ts.map