import { parseComponentId, type ComponentId } from './component-id.js';
import { domainError, type DomainError } from './domain-error.js';
import type { FigmaComponentInput, FigmaNode } from './figma-node.js';
import { err, ok, type Result } from './result.js';
import { toSlug, type Slug } from './slug.js';

export interface ComponentProp {
  readonly name: string;
  readonly kind: 'boolean' | 'text' | 'instance-swap' | 'variant';
  readonly defaultValue: string | boolean | null;
  readonly options: readonly string[];
}

/** The normalized, model-facing documentation record for one design-system component. */
export interface ComponentDoc {
  readonly id: ComponentId;
  readonly fileKey: string;
  readonly name: string;
  readonly slug: Slug;
  readonly description: string;
  readonly props: readonly ComponentProp[];
  readonly tokens: readonly string[];
  readonly indexedAt: string;
}

const SUPPORTED_TYPES = new Set(['COMPONENT', 'COMPONENT_SET']);
const FILE_KEY = /^[A-Za-z0-9]{10,64}$/;

const KIND: Record<string, ComponentProp['kind']> = {
  BOOLEAN: 'boolean',
  TEXT: 'text',
  INSTANCE_SWAP: 'instance-swap',
  VARIANT: 'variant',
};

/** Figma suffixes property keys with `#123:4`; models should see the human name. */
const cleanPropName = (key: string): string => key.replace(/#\d+:\d+$/, '');

const collectTokens = (node: FigmaNode, into: Set<string>): Set<string> => {
  for (const key of Object.keys(node.boundVariables ?? {})) into.add(key);
  for (const child of node.children ?? []) collectTokens(child, into);
  return into;
};

/**
 * Normalize a raw Figma component node into a ComponentDoc.
 * `indexedAt` is passed in (from the Clock port) so this stays deterministic.
 */
export const normalizeComponent = (
  input: FigmaComponentInput,
  indexedAt: Date,
): Result<ComponentDoc, DomainError> => {
  const { node, fileKey } = input;
  if (!FILE_KEY.test(fileKey)) {
    return err(domainError('INVALID_FILE_KEY', `"${fileKey}" is not a Figma file key.`));
  }
  if (!SUPPORTED_TYPES.has(node.type)) {
    return err(domainError('UNSUPPORTED_NODE_TYPE', `Node type ${node.type} is not a component.`));
  }
  const id = parseComponentId(node.id);
  if (!id.ok) return id;

  const name = node.name.trim();
  const slug = toSlug(name);
  if (slug.length === 0) {
    return err(domainError('INVALID_NAME', `Component ${node.id} has no usable name.`));
  }

  const props: ComponentProp[] = Object.entries(node.componentPropertyDefinitions ?? {})
    .map(([key, def]) => ({
      name: cleanPropName(key),
      kind: KIND[def.type] ?? 'text',
      defaultValue: def.defaultValue ?? null,
      options: [...(def.variantOptions ?? [])],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return ok({
    id: id.value,
    fileKey,
    name,
    slug,
    description: (node.description ?? '').trim(),
    props,
    tokens: [...collectTokens(node, new Set())].sort(),
    indexedAt: indexedAt.toISOString(),
  });
};
