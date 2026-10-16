import { err, ok, type Result } from './result.js';
import { domainError, type DomainError } from './domain-error.js';

declare const brand: unique symbol;

/** A Figma node id such as `12:345` (or `I12:345;67:89` for instances). */
export type ComponentId = string & { readonly [brand]: 'ComponentId' };

const NODE_ID = /^I?\d+:\d+(;\d+:\d+)*$/;

export const parseComponentId = (raw: string): Result<ComponentId, DomainError> =>
  NODE_ID.test(raw)
    ? ok(raw as ComponentId)
    : err(domainError('INVALID_NODE_ID', `"${raw}" is not a Figma node id (expected e.g. "12:345").`));
