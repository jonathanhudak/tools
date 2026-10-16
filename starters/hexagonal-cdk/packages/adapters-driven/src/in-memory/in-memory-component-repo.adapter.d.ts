import type { ComponentDoc, ComponentId, ComponentRepoPort } from '@hex/domain';
export declare class InMemoryComponentRepo implements ComponentRepoPort {
    private readonly docs;
    save(doc: ComponentDoc): Promise<void>;
    get(id: ComponentId): Promise<ComponentDoc | null>;
    /** Test helper. Not part of the port. */
    size(): number;
}
//# sourceMappingURL=in-memory-component-repo.adapter.d.ts.map