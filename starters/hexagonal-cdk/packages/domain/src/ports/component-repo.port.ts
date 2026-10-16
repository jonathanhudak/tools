import type { ComponentDoc } from '../model/component-doc.js';
import type { ComponentId } from '../model/component-id.js';

/** Durable storage for ComponentDocs. Implemented in adapters-driven. */
export interface ComponentRepoPort {
  save(doc: ComponentDoc): Promise<void>;
  get(id: ComponentId): Promise<ComponentDoc | null>;
}
