import type { ComponentDoc, ComponentId, ComponentRepoPort } from '@hex/domain';

export class InMemoryComponentRepo implements ComponentRepoPort {
  private readonly docs = new Map<ComponentId, ComponentDoc>();

  async save(doc: ComponentDoc): Promise<void> {
    this.docs.set(doc.id, doc);
  }

  async get(id: ComponentId): Promise<ComponentDoc | null> {
    return this.docs.get(id) ?? null;
  }

  /** Test helper. Not part of the port. */
  size(): number {
    return this.docs.size;
  }
}
